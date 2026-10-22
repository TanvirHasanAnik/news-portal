"use server";

import { revalidatePath } from "next/cache";
import {
  createAdminRequest,
  updateAdminRequestStatus,
} from "@/repositories/requestRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";

export async function createAdminRequestAction(prevState, formData) {
  try {
    const requestType = formData.get("requestType")?.toString().trim();
    const targetUserId = formData.get("targetUserId")?.toString().trim() || null;
    const note = formData.get("note")?.toString().trim() || "";
    const requestedRole = formData.get("requestedRole")?.toString().trim() || null;
    const requestedEmail = formData.get("requestedEmail")?.toString().trim() || null;
    const requestedName = formData.get("requestedName")?.toString().trim() || null;

    if (!requestType) {
      return { success: false, message: "আবেদনের ধরণ আবশ্যক।" };
    }

    const payload = {
      note,
      newRole: requestedRole,
      email: requestedEmail,
      name: requestedName,
    };

    await createAdminRequest({
      requesterId: "usr_reporter", // When auth is hooked, replaced by logged-in user id
      requestType,
      targetUserId,
      payload,
    });

    await recordAuditLog({
      action: "submit_admin_request",
      targetType: "admin_request",
      details: { requestType, targetUserId },
    });

    revalidatePath("/admin");

    return {
      success: true,
      message: "সুপার অ্যাডমিনের পর্যালোচনার জন্য আবেদনটি সফলভাবে জমা হয়েছে!",
    };
  } catch (error) {
    return { success: false, message: `আবেদন জমাদানে ত্রুটি: ${error.message}` };
  }
}

export async function updateAdminRequestStatusAction(requestId, newStatus, reviewerNote = "") {
  try {
    if (!requestId || !newStatus) {
      return { success: false, message: "অনুরোধ আইডি ও স্ট্যাটাস আবশ্যক।" };
    }

    await updateAdminRequestStatus(requestId, {
      status: newStatus,
      reviewedBy: "usr_superadmin",
      reviewerNote,
    });

    await recordAuditLog({
      action: newStatus === "approved" ? "approve_request" : "reject_request",
      targetType: "admin_request",
      targetId: requestId,
      details: { status: newStatus, reviewerNote },
    });

    revalidatePath("/admin");

    return {
      success: true,
      message: `আবেদনটি সফলভাবে ${newStatus === "approved" ? "অনুমোদন" : "প্রত্যাখ্যান"} করা হয়েছে।`,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

