"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";
import {
  cleanupExpiredOnlineDeskArticles,
  getExpiredOnlineDeskArticlesCount,
} from "@/repositories/articleRepository";
import { invalidateAllCaches, invalidateHomepage } from "@/lib/cache/invalidate";

export async function cleanupArticlesAction() {
  try {
    const user = await getCurrentUser();
    if (!user || !["super_admin", "admin"].includes(user.role)) {
      return {
        success: false,
        message: "অননুমোদিত অনুরোধ। কেবল সুপার অ্যাডমিন এবং অ্যাডমিন এই কাজটি করতে পারেন।",
      };
    }

    const result = await cleanupExpiredOnlineDeskArticles({
      daysOld: 30,
      minRetentionCount: 10,
      batchSize: 50,
      operatorId: user.id,
      operatorUsername: user.username,
    });

    invalidateHomepage();
    revalidatePath("/admin", "layout");

    if (result.deletedCount === 0) {
      return {
        success: true,
        deletedCount: 0,
        imagesDeleted: 0,
        message: "মুছে ফেলার মতো কোনো মেয়াদোত্তীর্ণ সংবাদ পাওয়া যায়নি। ন্যূনতম ১০টি সাম্প্রতিক সংবাদ সংরক্ষিত রয়েছে।",
      };
    }

    return {
      success: true,
      deletedCount: result.deletedCount,
      imagesDeleted: result.imagesDeleted,
      message: `সফলভাবে ${result.deletedCount}টি মেয়াদোত্তীর্ণ সংবাদ এবং সংশ্লিষ্ট ${result.imagesDeleted}টি মিডিয়া ফাইল মুছে ফেলা হয়েছে।`,
    };
  } catch (err) {
    console.error("cleanupArticlesAction error:", err);
    return {
      success: false,
      message: "সংবাদ পরিচ্ছন্নকরণ প্রক্রিয়া সম্পন্ন করার সময় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    };
  }
}

export async function revalidateAllCachesAction() {
  try {
    const user = await getCurrentUser();
    if (!user || !["super_admin", "admin"].includes(user.role)) {
      return {
        success: false,
        message: "অননুমোদিত অনুরোধ। কেবল সুপার অ্যাডমিন এবং অ্যাডমিন এই কাজটি করতে পারেন।",
      };
    }

    invalidateAllCaches();
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");

    return {
      success: true,
      message: "ওয়েবসাইটের সকল পাতার ক্যাশ সফলভাবে পুনর্নবীকরণ করা হয়েছে।",
    };
  } catch (err) {
    console.error("revalidateAllCachesAction error:", err);
    return {
      success: false,
      message: "ক্যাশ পুনর্নবীকরণ করার সময় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    };
  }
}

export async function getCleanupStatusAction() {
  try {
    const user = await getCurrentUser();
    if (!user || !["super_admin", "admin"].includes(user.role)) {
      return { success: false, count: 0 };
    }

    const count = await getExpiredOnlineDeskArticlesCount({
      daysOld: 30,
      minRetentionCount: 10,
    });

    return { success: true, count };
  } catch (err) {
    console.error("getCleanupStatusAction error:", err);
    return { success: false, count: 0 };
  }
}
