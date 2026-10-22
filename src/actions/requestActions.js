"use server";

import { revalidatePath } from "next/cache";
import {
  createAdminRequest,
  updateAdminRequestStatus,
} from "@/repositories/requestRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";
import {
  createAdminRequestSchema,
  updateAdminRequestStatusSchema,
  formatZodError,
} from "@/schemas";

export async function createAdminRequestAction(prevState, formData) {
  try {
    const rawData = {
      requestType: formData.get("requestType")?.toString().trim(),
      targetUserId: formData.get("targetUserId")?.toString().trim() || null,
      note: formData.get("note")?.toString().trim() || "",
      requestedRole: formData.get("requestedRole")?.toString().trim() || null,
      requestedEmail: formData.get("requestedEmail")?.toString().trim() || null,
      requestedName: formData.get("requestedName")?.toString().trim() || null,
    };

    const validated = createAdminRequestSchema.parse(rawData);

    const payload = {
      note: validated.note,
      newRole: validated.requestedRole,
      email: validated.requestedEmail,
      name: validated.requestedName,
    };

    await createAdminRequest({
      requesterId: "usr_reporter", // When auth is hooked, replaced by logged-in user id
      requestType: validated.requestType,
      targetUserId: validated.targetUserId,
      payload,
    });

    await recordAuditLog({
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
    const validated = updateAdminRequestStatusSchema.parse({
      requestId,
      newStatus,
      reviewerNote: reviewerNote || "",
    });

    await updateAdminRequestStatus(validated.requestId, {
      status: validated.newStatus,
      reviewedBy: "usr_superadmin",
      reviewerNote: validated.reviewerNote,
    });

    await recordAuditLog({
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

