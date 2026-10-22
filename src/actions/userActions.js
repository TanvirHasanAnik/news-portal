"use server";

import { revalidatePath } from "next/cache";
import { createUser, updateUserRole, updateUserStatus } from "@/repositories/userRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";
import {
  createUserSchema,
  updateUserRoleSchema,
  toggleUserStatusSchema,
  formatZodError,
} from "@/schemas";

export async function createUserAction(prevState, formData) {
  try {
    const rawData = {
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      role: formData.get("role")?.toString() || "reporter",
      bio: formData.get("bio")?.toString() || "",
    };

    const validated = createUserSchema.parse(rawData);

    const created = await createUser({
      name: validated.name,
      email: validated.email,
      role: validated.role,
      status: "active",
      bio: validated.bio || "",
    });

    await recordAuditLog({
      action: "create_user",
      targetType: "user",
      targetId: created.id,
      details: { name: validated.name, email: validated.email, role: validated.role },
    });

    revalidatePath("/admin");

    return {
      success: true,
      message: `"${validated.name}" (${validated.email}) ব্যবহারকারী সফলভাবে যুক্ত করা হয়েছে!`,
    };
  } catch (error) {
    if (error.message?.includes("UNIQUE constraint failed: users.email")) {
      return { success: false, message: "এই ইমেইল ঠিকানায় ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।" };
    }
    return { success: false, message: formatZodError(error, "ব্যবহারকারী যোগে সমস্যা হয়েছে।") };
  }
}

export async function updateUserRoleAction(userId, newRole) {
  try {
    const validated = updateUserRoleSchema.parse({ userId, role: newRole });

    await updateUserRole(validated.userId, validated.role);

    await recordAuditLog({
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
    const validated = toggleUserStatusSchema.parse({ userId, currentStatus });

    const newStatus = validated.currentStatus === "active" ? "disabled" : "active";
    await updateUserStatus(validated.userId, newStatus);

    await recordAuditLog({
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

