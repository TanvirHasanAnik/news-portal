"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { invalidateCategory } from "@/lib/cache/invalidate";
import { TAGS } from "@/lib/cache/tags";
import {
  createCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory,
  saveCategoriesBatch,
} from "@/repositories/categoryRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";
import { notifyAdmins } from "@/repositories/notificationRepository";
import {
  categorySchema,
  subcategorySchema,
  categoryBatchSchema,
  formatZodError,
} from "@/schemas";
import { getCurrentUser } from "@/lib/auth/server";

export async function createCategoryAction(prevState, formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return { success: false, message: "শুধুমাত্র সুপার অ্যাডমিন নতুন ক্যাটাগরি তৈরি করতে পারেন।" };
    }

    const rawData = {
      name: formData.get("name")?.toString() || "",
      slug: formData.get("slug")?.toString() || "",
      sortOrder: formData.get("sortOrder")?.toString() || "10",
    };

    const validated = categorySchema.parse(rawData);

    await createCategory(validated);

    await recordAuditLog({
      userId: currentUser.id,
      action: "create_category",
      targetType: "category",
      details: { name: validated.name, slug: validated.slug },
    });

    await notifyAdmins({
      type: "admin_category_created",
      title: "নতুন ক্যাটাগরি তৈরি",
      message: `সুপার অ্যাডমিন কর্তৃক নতুন ক্যাটাগরি "${validated.name}" তৈরি করা হয়েছে।`,
      targetType: "category",
      actionBy: currentUser.username,
    });

    invalidateCategory(validated.slug);
    revalidatePath("/admin");

    return { success: true, message: `"${validated.name}" ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে!` };
  } catch (error) {
    return { success: false, message: formatZodError(error, "ক্যাটাগরি তৈরিতে সমস্যা হয়েছে।") };
  }
}

export async function deleteCategoryAction(categoryId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return { success: false, message: "শুধুমাত্র সুপার অ্যাডমিন ক্যাটাগরি মুছে ফেলতে পারেন।" };
    }

    if (!categoryId || typeof categoryId !== "string") {
      return { success: false, message: "ক্যাটাগরি আইডি আবশ্যক।" };
    }

    const res = await deleteCategory(categoryId);

    await recordAuditLog({
      userId: currentUser.id,
      action: "delete_category",
      targetType: "category",
      targetId: categoryId,
    });

    await notifyAdmins({
      type: "admin_category_deleted",
      title: "ক্যাটাগরি মুছে ফেলা হয়েছে",
      message: "সুপার অ্যাডমিন কর্তৃক ক্যাটাগরি মুছে ফেলা হয়েছে।",
      targetType: "category",
      actionBy: currentUser.username,
    });

    invalidateCategory(res?.slug || null);
    revalidatePath("/admin");

    return { success: true, message: "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function createSubcategoryAction(prevState, formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return { success: false, message: "শুধুমাত্র সুপার অ্যাডমিন উপ-বিভাগ যোগ করতে পারেন।" };
    }

    const rawData = {
      categoryId: formData.get("categoryId")?.toString() || "",
      name: formData.get("name")?.toString() || "",
      slug: formData.get("slug")?.toString() || "",
      sortOrder: formData.get("sortOrder")?.toString() || "10",
    };

    const validated = subcategorySchema.parse(rawData);

    const res = await createSubcategory(validated);

    await recordAuditLog({
      userId: currentUser.id,
      action: "create_subcategory",
      targetType: "subcategory",
      details: { categoryId: validated.categoryId, name: validated.name, slug: validated.slug },
    });

    await notifyAdmins({
      type: "admin_subcategory_created",
      title: "নতুন উপ-বিভাগ তৈরি",
      message: `সুপার অ্যাডমিন কর্তৃক নতুন উপ-বিভাগ "${validated.name}" তৈরি করা হয়েছে।`,
      targetType: "subcategory",
      actionBy: currentUser.username,
    });

    invalidateCategory(res?.categorySlug || null);
    revalidatePath("/admin");

    return { success: true, message: `"${validated.name}" উপ-বিভাগ সফলভাবে যোগ করা হয়েছে!` };
  } catch (error) {
    return { success: false, message: formatZodError(error, "উপ-বিভাগ যোগে সমস্যা হয়েছে।") };
  }
}

export async function deleteSubcategoryAction(subcategoryId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return { success: false, message: "শুধুমাত্র সুপার অ্যাডমিন উপ-বিভাগ মুছে ফেলতে পারেন।" };
    }

    if (!subcategoryId || typeof subcategoryId !== "string") {
      return { success: false, message: "উপ-বিভাগ আইডি আবশ্যক।" };
    }

    const res = await deleteSubcategory(subcategoryId);

    await recordAuditLog({
      userId: currentUser.id,
      action: "delete_subcategory",
      targetType: "subcategory",
      targetId: subcategoryId,
    });

    await notifyAdmins({
      type: "admin_subcategory_deleted",
      title: "উপ-বিভাগ মুছে ফেলা হয়েছে",
      message: "সুপার অ্যাডমিন কর্তৃক উপ-বিভাগ মুছে ফেলা হয়েছে।",
      targetType: "subcategory",
      actionBy: currentUser.username,
    });

    invalidateCategory(res?.categorySlug || null);
    revalidatePath("/admin");

    return { success: true, message: "উপ-বিভাগ সফলভাবে মুছে ফেলা হয়েছে।" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function saveCategoriesBatchAction(categories) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return { success: false, message: "শুধুমাত্র সুপার অ্যাডমিন ক্যাটাগরি হালনাগাদ করতে পারেন।" };
    }

    const validatedCategories = categoryBatchSchema.parse(categories);

    const res = await saveCategoriesBatch(validatedCategories);

    await recordAuditLog({
      userId: currentUser.id,
      action: "batch_update_categories",
      targetType: "categories",
      details: { count: validatedCategories.length },
    });

    await notifyAdmins({
      type: "admin_categories_updated",
      title: "ক্যাটাগরি বিন্যাস হালনাগাদ",
      message: "সুপার অ্যাডমিন কর্তৃক ক্যাটাগরি ও উপ-বিভাগের তালিকা হালনাগাদ করা হয়েছে।",
      targetType: "categories",
      actionBy: currentUser.username,
    });

    invalidateCategory(null);

    const slugsToRevalidate = res?.affectedSlugs || validatedCategories.map((c) => c.slug);
    for (const slug of slugsToRevalidate) {
      if (slug) {
        revalidateTag(TAGS.CATEGORY(slug));
      }
    }

    revalidatePath("/admin");

    return {
      success: true,
      message: "ক্যাটাগরি ও উপ-বিভাগের পরিবর্তনগুলো সফলভাবে সংরক্ষিত হয়েছে!",
    };
  } catch (error) {
    return { success: false, message: formatZodError(error, "সংরক্ষণ সম্পন্ন করা যায়নি।") };
  }
}
