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

export async function addCuratedNewsAction(prevState, formData) {
  try {
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
    if (!id) return { success: false, message: "আইডি আবশ্যক।" };
    await removeCuratedNews(id);
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
    if (!id) return { success: false, message: "আইডি আবশ্যক।" };
    await toggleCuratedNews(id, currentActive);
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
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return { success: false, message: "অবৈধ তথ্য" };
    }
    await updateCuratedNewsPriorities(orderedIds);
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/category/handpicked");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Server Action: Saves the batch of curated items to database
 * and triggers On-Demand Incremental Static Regeneration (ISR).
 */
export async function saveCuratedBatchAction(type, items) {
  try {
    if (!type || (type !== "handpicked" && type !== "breaking")) {
      return { success: false, message: "অবৈধ কিউরেশন ধরন।" };
    }

    const validatedItems = curatedBatchSchema.parse(items);

    // Business Logic: Prevent duplicate articles in the curated list
    const seenArticles = new Set();
    for (const item of validatedItems) {
      const artId = item.article_id || item.articleId;
      if (artId) {
        if (seenArticles.has(artId)) {
          return {
            success: false,
            message: `তালিকায় একই সংবাদ একাধিকবার যুক্ত রয়েছে। অনুলিপিটি সরিয়ে পুনরায় সংরক্ষণ করুন।`,
          };
        }
        seenArticles.add(artId);
      }
    }

    await saveCuratedNewsBatch(type, validatedItems);

    await recordAuditLog({
      action: "batch_update_curation",
      targetType: "curated_news",
      details: { type, count: validatedItems.length },
    });

    // Trigger On-Demand Incremental Static Regeneration (ISR)
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/category/handpicked");

    return {
      success: true,
      message: `পরিবর্তনগুলো সফলভাবে ডেটাবেসে সংরক্ষিত ও লাইভ ওয়েবসাইটে আপডেট হয়েছে!`,
    };
  } catch (error) {
    return { success: false, message: formatZodError(error, "সংরক্ষণ সম্পন্ন করা যায়নি।") };
  }
}

