"use server";

import { revalidatePath } from "next/cache";
import {
  addCuratedNews,
  removeCuratedNews,
  toggleCuratedNews,
  updateCuratedNewsPriorities,
  saveCuratedNewsBatch,
} from "@/repositories/curationRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";
import { curatedItemSchema, curatedBatchSchema, formatZodError } from "@/schemas";
import { getCurrentUser } from "@/lib/auth/server";

const ALLOWED_CURATION_ROLES = ["super_admin", "admin", "editor_in_chief"];

export async function addCuratedNewsAction(prevState, formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !ALLOWED_CURATION_ROLES.includes(currentUser.role)) {
      return { success: false, message: "কিউরেশন ব্যবস্থাপনার অনুমতি আপনার নেই।" };
    }

    const rawData = {
      type: formData.get("type")?.toString().trim(),
      articleId: formData.get("articleId")?.toString().trim() || null,
      customTitle: formData.get("customTitle")?.toString().trim() || null,
      customUrl: formData.get("customUrl")?.toString().trim() || null,
      priority: formData.get("priority")?.toString() || "0",
    };

    const validated = curatedItemSchema.parse(rawData);

    await addCuratedNews({
      type: validated.type,
      articleId: validated.articleId,
      customTitle: validated.customTitle || "",
      customUrl: validated.customUrl || "",
      priority: validated.priority,
    });

    await recordAuditLog({
      userId: currentUser.id,
      action: "add_curation",
      targetType: "curated_news",
      details: { type: validated.type, articleId: validated.articleId, customTitle: validated.customTitle },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/category/handpicked");

    return {
      success: true,
      message: `আইটেমটি সফলভাবে ${validated.type === "handpicked" ? "বাছাইকৃত" : "জরুরি সংবাদ"} তালিকায় যুক্ত হয়েছে!`,
    };
  } catch (error) {
    return { success: false, message: formatZodError(error, "আইটেম যুক্ত করা সম্ভব হয়নি।") };
  }
}

export async function removeCuratedNewsAction(id) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !ALLOWED_CURATION_ROLES.includes(currentUser.role)) {
      return { success: false, message: "কিউরেশন ব্যবস্থাপনার অনুমতি আপনার নেই।" };
    }

    if (!id) return { success: false, message: "আইডি আবশ্যক।" };
    await removeCuratedNews(id);

    await recordAuditLog({
      userId: currentUser.id,
      action: "remove_curation",
      targetType: "curated_news",
      targetId: id,
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/category/handpicked");
    return { success: true, message: "আইটেমটি তালিকা থেকে সরানো হয়েছে।" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function toggleCuratedNewsAction(id, currentActive) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !ALLOWED_CURATION_ROLES.includes(currentUser.role)) {
      return { success: false, message: "কিউরেশন ব্যবস্থাপনার অনুমতি আপনার নেই।" };
    }

    if (!id) return { success: false, message: "আইডি আবশ্যক।" };
    await toggleCuratedNews(id, currentActive);

    await recordAuditLog({
      userId: currentUser.id,
      action: "toggle_curation",
      targetType: "curated_news",
      targetId: id,
      details: { active: currentActive ? 0 : 1 },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/category/handpicked");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function reorderCuratedNewsAction(orderedIds) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !ALLOWED_CURATION_ROLES.includes(currentUser.role)) {
      return { success: false, message: "কিউরেশন ব্যবস্থাপনার অনুমতি আপনার নেই।" };
    }

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return { success: false, message: "অবৈধ তথ্য" };
    }
    await updateCuratedNewsPriorities(orderedIds);

    await recordAuditLog({
      userId: currentUser.id,
      action: "reorder_curation",
      targetType: "curated_news",
      details: { count: orderedIds.length },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/category/handpicked");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function saveCuratedBatchAction(type, items) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !ALLOWED_CURATION_ROLES.includes(currentUser.role)) {
      return { success: false, message: "কিউরেশন ব্যবস্থাপনার অনুমতি আপনার নেই।" };
    }

    if (!type || (type !== "handpicked" && type !== "breaking")) {
      return { success: false, message: "অবৈধ কিউরেশন ধরন।" };
    }

    const validatedItems = curatedBatchSchema.parse(items);

    const seenArticles = new Set();
    for (const item of validatedItems) {
      const artId = item.article_id || item.articleId;
      if (artId) {
        if (seenArticles.has(artId)) {
          return {
            success: false,
            message: "তালিকায় একই সংবাদ একাধিকবার যুক্ত রয়েছে। অনুলিপিটি সরিয়ে পুনরায় সংরক্ষণ করুন।",
          };
        }
        seenArticles.add(artId);
      }
    }

    await saveCuratedNewsBatch(type, validatedItems);

    await recordAuditLog({
      userId: currentUser.id,
      action: "batch_update_curation",
      targetType: "curated_news",
      details: { type, count: validatedItems.length },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/category/handpicked");

    return {
      success: true,
      message: "পরিবর্তনগুলো সফলভাবে ডেটাবেসে সংরক্ষিত ও লাইভ ওয়েবসাইটে আপডেট হয়েছে!",
    };
  } catch (error) {
    return { success: false, message: formatZodError(error, "সংরক্ষণ সম্পন্ন করা যায়নি।") };
  }
}
