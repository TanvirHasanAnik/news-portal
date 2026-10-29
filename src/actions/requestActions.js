"use server";

import { revalidatePath } from "next/cache";
import {
  createAdminRequest,
  updateAdminRequestStatus,
} from "@/repositories/requestRepository";
import { getUserById } from "@/repositories/userRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";
import {
  createAdminRequestSchema,
  updateAdminRequestStatusSchema,
  formatZodError,
} from "@/schemas";
import { hasPermission, isSingleUserRole } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth/server";

export async function createAdminRequestAction(prevState, formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "requests:create")) {
      return {
        success: false,
        message: "অননুমোদিত: আপনার আবেদন জমা দেওয়ার অনুমতি নেই।",
      };
    }

    const rawData = {
      requestType: formData.get("requestType")?.toString().trim(),
      targetUserId: formData.get("targetUserId")?.toString().trim() || null,
      note: formData.get("note")?.toString().trim() || "",
      requestedRole: formData.get("requestedRole")?.toString().trim() || null,
      requestedEmail: formData.get("requestedEmail")?.toString().trim() || null,
      requestedName: formData.get("requestedName")?.toString().trim() || null,
    };

    const validated = createAdminRequestSchema.parse(rawData);


    if (validated.requestedRole && isSingleUserRole(validated.requestedRole)) {
      return {
        success: false,
        message: "সুপার অ্যাডমিন বা অ্যাডমিন একক দায়িত্ব; এই পদবীর জন্য আবেদন করা সম্ভব নয়।",
      };
    }

    if (validated.targetUserId) {
      const targetUser = await getUserById(validated.targetUserId);
      if (targetUser && isSingleUserRole(targetUser.role)) {
        return {
          success: false,
          message: "স্থায়ী সুপার অ্যাডমিন বা অ্যাডমিন অ্যাকাউন্টের বিরুদ্ধে আবেদন করা যাবে না।",
        };
      }
    }

    const payload = {
      note: validated.note,
      newRole: validated.requestedRole,
      email: validated.requestedEmail,
      name: validated.requestedName,
    };

    await createAdminRequest({
      requesterId: currentUser.id,
      requestType: validated.requestType,
      targetUserId: validated.targetUserId,
      payload,
    });

    await recordAuditLog({
      userId: currentUser.id,
      action: "submit_admin_request",
      targetType: "admin_request",
      details: { requestType: validated.requestType, targetUserId: validated.targetUserId },
    });

    revalidatePath("/admin");

    return {
      success: true,
      message: "সুপার অ্যাডমিনের পর্যালোচনার জন্য আবেদনটি সফলভাবে জমা হয়েছে!",
    };
  } catch (error) {
    return { success: false, message: formatZodError(error, "আবেদন জমাদানে সমস্যা হয়েছে।") };
  }
}

export async function updateAdminRequestStatusAction(requestId, newStatus, reviewerNote = "") {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "requests:review")) {
      return {
        success: false,
        message: "অননুমোদিত: শুধুমাত্র সুপার অ্যাডমিন আবেদন অনুমোদন বা প্রত্যাখ্যান করতে পারবেন।",
      };
    }

    const validated = updateAdminRequestStatusSchema.parse({
      requestId,
      newStatus,
      reviewerNote: reviewerNote || "",
    });

    await updateAdminRequestStatus(validated.requestId, {
      status: validated.newStatus,
      reviewedBy: currentUser.id,
      reviewerNote: validated.reviewerNote,
    });

    await recordAuditLog({
      userId: currentUser.id,
      action: validated.newStatus === "approved" ? "approve_request" : "reject_request",
      targetType: "admin_request",
      targetId: validated.requestId,
      details: { status: validated.newStatus, reviewerNote: validated.reviewerNote },
    });

    revalidatePath("/admin");

    return {
      success: true,
      message: `আবেদনটি সফলভাবে ${validated.newStatus === "approved" ? "অনুমোদন" : "প্রত্যাখ্যান"} করা হয়েছে।`,
    };
  } catch (error) {
    return { success: false, message: formatZodError(error, "স্ট্যাটাস আপডেটে সমস্যা হয়েছে।") };
  }
}
