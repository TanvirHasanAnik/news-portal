"use server";

import { revalidatePath } from "next/cache";
import {
  addCuratedNews,
  removeCuratedNews,
  toggleCuratedNews,
  updateCuratedNewsPriorities,
} from "@/repositories/curationRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";

export async function addCuratedNewsAction(prevState, formData) {
  try {
    const type = formData.get("type")?.toString().trim(); // handpicked | breaking
    const articleId = formData.get("articleId")?.toString().trim() || null;
    const customTitle = formData.get("customTitle")?.toString().trim() || "";
    const customUrl = formData.get("customUrl")?.toString().trim() || "";
    const priority = parseInt(formData.get("priority")?.toString() || "0", 10);

    if (!type) {
      return { success: false, message: "কিউরেশন ধরন আবশ্যক।" };
    }
    if (!articleId && !customTitle) {
      return { success: false, message: "একটি আর্টিকেল নির্বাচন করুন অথবা শিরোনাম লিখুন।" };
    }

    await addCuratedNews({ type, articleId, customTitle, customUrl, priority });

    await recordAuditLog({
      action: "add_curation",
      targetType: "curated_news",
      details: { type, articleId, customTitle },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/category/handpicked");

    return {
      success: true,
      message: `আইটেমটি সফলভাবে ${type === "handpicked" ? "বাছাইকৃত" : "জরুরি সংবাদ"} তালিকায় যুক্ত হয়েছে!`,
    };
  } catch (error) {
    return { success: false, message: `সংযোজনে সমস্যা: ${error.message}` };
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

