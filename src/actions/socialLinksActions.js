"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";
import { updateSocialLinks } from "@/repositories/socialLinksRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";
import { notifyAdmins } from "@/repositories/notificationRepository";
import { socialLinksSchema, formatZodError } from "@/schemas";

export async function saveSocialLinksAction(prevState, formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return {
        success: false,
        message: "শুধুমাত্র সুপার অ্যাডমিনের এই পরিবর্তনের অনুমতি রয়েছে।",
      };
    }

    let rawData = {};
    if (formData instanceof FormData) {
      rawData = {
        facebook: formData.get("facebook")?.toString() || "",
        youtube: formData.get("youtube")?.toString() || "",
        twitter: formData.get("twitter")?.toString() || "",
        instagram: formData.get("instagram")?.toString() || "",
      };
    } else if (formData && typeof formData === "object") {
      rawData = {
        facebook: formData.facebook || "",
        youtube: formData.youtube || "",
        twitter: formData.twitter || "",
        instagram: formData.instagram || "",
      };
    }

    const validationResult = socialLinksSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        message: formatZodError(validationResult.error, "সঠিক ওয়েব ঠিকানা (URL) প্রদান করুন।"),
      };
    }

    const updated = await updateSocialLinks(validationResult.data);

    try {
      await recordAuditLog({
        userId: currentUser.id,
        action: "update_social_links",
        targetType: "social_links",
        targetId: "default",
        details: validationResult.data,
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    await notifyAdmins({
      type: "admin_social_links_updated",
      title: "সোশ্যাল মিডিয়া লিংক হালনাগাদ",
      message: "সুপার অ্যাডমিন কর্তৃক সামাজিক যোগাযোগ মাধ্যমের লিংক পরিবর্তন করা হয়েছে।",
      targetType: "social_links",
      actionBy: currentUser.username,
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      message: "সামাজিক যোগাযোগ মাধ্যমের লিংক সফলভাবে সংরক্ষণ করা হয়েছে।",
      data: updated,
    };
  } catch (error) {
    console.error("saveSocialLinksAction error:", error);
    return {
      success: false,
      message: "সংরক্ষণ করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    };
  }
}

