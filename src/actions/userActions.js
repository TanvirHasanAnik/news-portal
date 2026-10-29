"use server";

import { revalidatePath } from "next/cache";
import {
  createUser,
  updateUserRole,
  updateUserStatus,
  getUserById,
} from "@/repositories/userRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";
import {
  createUserSchema,
  updateUserRoleSchema,
  toggleUserStatusSchema,
  formatZodError,
} from "@/schemas";
import { hasPermission, isSingleUserRole } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth/server";

export async function createUserAction(prevState, formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "users:create")) {
      return {
        success: false,
        message: "অননুমোদিত: আপনার নতুন ব্যবহারকারী যোগ করার অনুমতি নেই।",
      };
    }

    const rawData = {
      username: formData.get("username")?.toString() || "",
      fullName: formData.get("fullName")?.toString() || formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      password: formData.get("password")?.toString() || "",
      role: formData.get("role")?.toString() || "reporter",
      bio: formData.get("bio")?.toString() || "",
    };

    const validated = createUserSchema.parse(rawData);


    if (isSingleUserRole(validated.role)) {
      return {
        success: false,
        message: "সুপার অ্যাডমিন এবং অ্যাডমিন একক দায়িত্ব; নতুন অ্যাডমিন তৈরি করা সম্ভব নয়।",
      };
    }

    const created = await createUser({
      username: validated.username,
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      password: validated.password,
      role: validated.role,
      status: "active",
      bio: validated.bio || "",
    });

    await recordAuditLog({
      userId: currentUser.id,
      action: "create_user",
      targetType: "user",
      targetId: created.id,
      details: { username: validated.username, role: validated.role },
    });

    revalidatePath("/admin");

    return {
      success: true,
      message: `"${validated.username}" ব্যবহারকারী সফলভাবে যুক্ত করা হয়েছে!`,
    };
  } catch (error) {
    if (
      error.message?.includes("UNIQUE constraint failed: users.username") ||
      error.message?.includes("uq_users_username") ||
      error.message?.includes("Duplicate entry")
    ) {
      return { success: false, message: "এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে অন্য ইউজারনেম দিন।" };
    }
    return { success: false, message: formatZodError(error, "ব্যবহারকারী যোগে সমস্যা হয়েছে।") };
  }
}

export async function updateUserRoleAction(userId, newRole) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "users:edit_role")) {
      return {
        success: false,
        message: "অননুমোদিত: ব্যবহারকারীর দায়িত্ব পরিবর্তনের অনুমতি নেই।",
      };
    }

    const validated = updateUserRoleSchema.parse({ userId, role: newRole });


    if (isSingleUserRole(validated.role)) {
      return {
        success: false,
        message: "কোনো ব্যবহারকারীকে সুপার অ্যাডমিন বা অ্যাডমিন পদে উন্নীত করা যাবে না।",
      };
    }

    const targetUser = await getUserById(validated.userId);

    if (targetUser && isSingleUserRole(targetUser.role)) {
      return {
        success: false,
        message: "স্থায়ী সুপার অ্যাডমিন বা অ্যাডমিনের দায়িত্ব পরিবর্তন করা যাবে না।",
      };
    }

    await updateUserRole(validated.userId, validated.role);

    await recordAuditLog({
      userId: currentUser.id,
      action: "update_user_role",
      targetType: "user",
      targetId: validated.userId,
      details: { newRole: validated.role },
    });

    revalidatePath("/admin");

    return { success: true, message: "ব্যবহারকারীর দায়িত্ব সফলভাবে আপডেট করা হয়েছে।" };
  } catch (error) {
    return { success: false, message: formatZodError(error, "দায়িত্ব আপডেটে সমস্যা হয়েছে।") };
  }
}

export async function toggleUserStatusAction(userId, currentStatus) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "users:disable")) {
      return {
        success: false,
        message: "অননুমোদিত: ব্যবহারকারীর স্ট্যাটাস পরিবর্তনের অনুমতি নেই।",
      };
    }

    const validated = toggleUserStatusSchema.parse({ userId, currentStatus });

    const targetUser = await getUserById(validated.userId);

    if (targetUser && isSingleUserRole(targetUser.role)) {
      return {
        success: false,
        message: "সুপার অ্যাডমিন বা অ্যাডমিনের অ্যাকাউন্ট নিষ্ক্রিয় করা সম্ভব নয়।",
      };
    }

    const newStatus = validated.currentStatus === "active" ? "disabled" : "active";
    await updateUserStatus(validated.userId, newStatus);

    await recordAuditLog({
      userId: currentUser.id,
      action: newStatus === "disabled" ? "disable_user" : "enable_user",
      targetType: "user",
      targetId: validated.userId,
      details: { newStatus },
    });

    revalidatePath("/admin");

    return {
      success: true,
      status: newStatus,
      message: `ব্যবহারকারী সফলভাবে ${newStatus === "active" ? "পুনরায় সক্রিয়" : "সাময়িক নিষ্ক্রিয়"} করা হয়েছে।`,
    };
  } catch (error) {
    return { success: false, message: formatZodError(error, "স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে।") };
  }
}
