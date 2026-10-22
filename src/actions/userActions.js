"use server";

import { revalidatePath } from "next/cache";
import { createUser, updateUserRole, updateUserStatus } from "@/repositories/userRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";

export async function createUserAction(prevState, formData) {
  try {
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const role = formData.get("role")?.toString().trim() || "reporter";
    const bio = formData.get("bio")?.toString().trim() || "";

    if (!name) {
      return { success: false, message: "ব্যবহারকারীর নাম আবশ্যক।" };
    }
    if (!email || !email.includes("@")) {
      return { success: false, message: "একটি কার্যকর ইমেইল ঠিকানা আবশ্যক।" };
    }

    const created = await createUser({ name, email, role, status: "active", bio });

    await recordAuditLog({
      action: "create_user",
      targetType: "user",
      targetId: created.id,
      details: { name, email, role },
    });

    revalidatePath("/admin");

    return {
      success: true,
      message: `"${name}" (${email}) ব্যবহারকারী সফলভাবে যুক্ত/আমন্ত্রিত হয়েছে!`,
    };
  } catch (error) {
    if (error.message?.includes("UNIQUE constraint failed: users.email")) {
      return { success: false, message: "এই ইমেইল ঠিকানায় ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।" };
    }
    return { success: false, message: `ব্যবহারকারী যোগে ত্রুটি: ${error.message}` };
  }
}

export async function updateUserRoleAction(userId, newRole) {
  try {
    if (!userId || !newRole) {
      return { success: false, message: "ব্যবহারকারী এবং রোল আবশ্যক।" };
    }

    await updateUserRole(userId, newRole);

    await recordAuditLog({
      action: "update_user_role",
      targetType: "user",
      targetId: userId,
      details: { newRole },
    });

    revalidatePath("/admin");

    return { success: true, message: "ব্যবহারকারীর দায়িত্ব সফলভাবে আপডেট করা হয়েছে।" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function toggleUserStatusAction(userId, currentStatus) {
  try {
    if (!userId) {
      return { success: false, message: "ব্যবহারকারী আইডি আবশ্যক।" };
    }

    const newStatus = currentStatus === "active" ? "disabled" : "active";
    await updateUserStatus(userId, newStatus);

    await recordAuditLog({
      action: newStatus === "disabled" ? "disable_user" : "enable_user",
      targetType: "user",
      targetId: userId,
      details: { newStatus },
    });

    revalidatePath("/admin");

    return {
      success: true,
      status: newStatus,
      message: `ব্যবহারকারী সফলভাবে ${newStatus === "active" ? "পুনরায় সক্রিয়" : "সাময়িক নিষ্ক্রিয়"} করা হয়েছে।`,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

