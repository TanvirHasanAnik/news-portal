"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  loginSchema,
  updateProfileSchema,
  changeAdminPasswordSchema,
  adminResetStaffPasswordSchema,
  formatZodError,
} from "@/schemas";
import {
  getUserById,
  getUserByUsernameOrEmail,
  updateUserPassword,
  updateUserProfile,
} from "@/repositories/userRepository";
import { createJwtToken } from "@/lib/auth/jwt";
import { setAuthCookie, removeAuthCookie } from "@/lib/auth/cookies";
import { getCurrentUser } from "@/lib/auth/server";
import { recordAuditLog } from "@/repositories/analyticsRepository";
import { getFallbackPasswordForRole } from "@/lib/db/bootstrap";

const BCRYPT_SALT_ROUNDS = 12;



export async function loginAction(prevState, formData) {
  try {
    const rawData = {
      username: (formData.get("username") || formData.get("email") || "").toString(),
      password: (formData.get("password") || "").toString(),
    };

    const validated = loginSchema.parse(rawData);


    const user = await getUserByUsernameOrEmail(validated.username);
    if (!user || !user.password) {
      return {
        success: false,
        message: "প্রদত্ত ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।",
      };
    }

    if (user.status !== "active") {
      return {
        success: false,
        message:
          "আপনার অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে যোগাযোগ করুন।",
      };
    }


    let isMatch = false;
    const isBcryptHash =
      user.password.startsWith("$2a$") ||
      user.password.startsWith("$2b$") ||
      user.password.startsWith("$2y$");

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(validated.password, user.password);
    } else {

      if (user.password === validated.password) {
        isMatch = true;
        const newHash = await bcrypt.hash(validated.password, BCRYPT_SALT_ROUNDS);
        await updateUserPassword(user.id, newHash);
      }
    }

    if (!isMatch) {
      return {
        success: false,
        message: "প্রদত্ত ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।",
      };
    }


    const token = await createJwtToken({
      sub: user.id,
      username: user.username,
      email: user.email || "",
      name: user.full_name || user.name || user.username,
      role: user.role,
      status: user.status,
      mustChangePassword: Boolean(user.must_change_password),
    });


    await setAuthCookie(token);


    try {
      await recordAuditLog({
        userId: user.id,
        action: "login",
        targetType: "user",
        targetId: user.id,
        details: { username: user.username, role: user.role },
      });
    } catch (_auditErr) {

    }

    return {
      success: true,
      redirectUrl: "/admin",
    };
  } catch (error) {
    return {
      success: false,
      message: formatZodError(error, "লগইন করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।"),
    };
  }
}



export async function logoutAction() {
  await removeAuthCookie();
  redirect("/admin/login");
}



export async function updateProfileAction(prevState, formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: "অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।",
      };
    }

    const rawData = {
      fullName: (formData.get("fullName") || "").toString(),
      email: (formData.get("email") || "").toString(),
      phone: (formData.get("phone") || "").toString(),
      bio: (formData.get("bio") || "").toString(),
    };

    const validated = updateProfileSchema.parse(rawData);

    await updateUserProfile(currentUser.id, {
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      bio: validated.bio,
    });

    try {
      await recordAuditLog({
        userId: currentUser.id,
        action: "update_profile",
        targetType: "user",
        targetId: currentUser.id,
        details: { fullName: validated.fullName, email: validated.email, phone: validated.phone },
      });
    } catch (_err) {

    }

    revalidatePath("/admin");
    return {
      success: true,
      message: "প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।",
    };
  } catch (error) {
    return {
      success: false,
      message: formatZodError(error, "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।"),
    };
  }
}



export async function changeAdminPasswordAction(prevState, formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "অননুমোদিত অনুরোধ।" };
    }

    if (currentUser.role !== "super_admin" && currentUser.role !== "admin") {
      return {
        success: false,
        message: "শুধুমাত্র সুপার অ্যাডমিন ও অ্যাডমিন নিজস্ব পাসওয়ার্ড পরিবর্তন করতে পারেন।",
      };
    }

    const rawData = {
      currentPassword: (formData.get("currentPassword") || "").toString(),
      newPassword: (formData.get("newPassword") || "").toString(),
      confirmPassword: (formData.get("confirmPassword") || "").toString(),
    };

    const validated = changeAdminPasswordSchema.parse(rawData);


    const dbUser = await getUserByUsernameOrEmail(currentUser.username);
    if (!dbUser || !dbUser.password) {
      return { success: false, message: "ব্যবহারকারীর তথ্য পাওয়া যায়নি।" };
    }

    const isMatch = await bcrypt.compare(validated.currentPassword, dbUser.password);
    if (!isMatch) {
      return { success: false, message: "বর্তমান পাসওয়ার্ড সঠিক নয়।" };
    }

    const hashed = await bcrypt.hash(validated.newPassword, BCRYPT_SALT_ROUNDS);
    await updateUserPassword(currentUser.id, hashed);

    try {
      await recordAuditLog({
        userId: currentUser.id,
        action: "change_password",
        targetType: "user",
        targetId: currentUser.id,
        details: { role: currentUser.role },
      });
    } catch (_err) {

    }

    revalidatePath("/admin");
    return {
      success: true,
      message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।",
    };
  } catch (error) {
    return {
      success: false,
      message: formatZodError(error, "পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে।"),
    };
  }
}



export async function adminResetStaffPasswordAction(prevState, formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return {
        success: false,
        message: "শুধুমাত্র সুপার অ্যাডমিন অন্যান্য সদস্যদের পাসওয়ার্ড পরিবর্তন করতে পারেন।",
      };
    }

    const rawData = {
      userId: (formData.get("userId") || "").toString(),
      newPassword: (formData.get("newPassword") || "").toString(),
    };

    const validated = adminResetStaffPasswordSchema.parse(rawData);

    const targetUser = await getUserById(validated.userId);
    if (!targetUser) {
      return { success: false, message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" };
    }

    if (targetUser.role === "super_admin" || targetUser.role === "admin") {
      return {
        success: false,
        message: "সুপার অ্যাডমিন বা অ্যাডমিনের পাসওয়ার্ড এখান থেকে পরিবর্তন করা যাবে না।",
      };
    }

    const hashed = await bcrypt.hash(validated.newPassword, BCRYPT_SALT_ROUNDS);
    await updateUserPassword(targetUser.id, hashed);

    try {
      await recordAuditLog({
        userId: currentUser.id,
        action: "admin_reset_user_password",
        targetType: "user",
        targetId: targetUser.id,
        details: { targetUsername: targetUser.username, targetRole: targetUser.role },
      });
    } catch (_err) {

    }

    revalidatePath("/admin");
    return {
      success: true,
      message: `"${targetUser.username}" ব্যবহারকারীর পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatZodError(error, "পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।"),
    };
  }
}
