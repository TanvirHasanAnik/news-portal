"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory,
  saveCategoriesBatch,
} from "@/repositories/categoryRepository";
import { recordAuditLog } from "@/repositories/analyticsRepository";
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

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin");
    if (validated.slug) {
      revalidatePath(`/category/${validated.slug}`);
    }

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

    await deleteCategory(categoryId);

    await recordAuditLog({
      userId: currentUser.id,
      action: "delete_category",
      targetType: "category",
      targetId: categoryId,
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
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

    await createSubcategory(validated);

    await recordAuditLog({
      userId: currentUser.id,
      action: "create_subcategory",
      targetType: "subcategory",
      details: { categoryId: validated.categoryId, name: validated.name, slug: validated.slug },
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
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

    await deleteSubcategory(subcategoryId);

    await recordAuditLog({
      userId: currentUser.id,
      action: "delete_subcategory",
      targetType: "subcategory",
      targetId: subcategoryId,
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
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

    revalidatePath("/", "layout"); 
    revalidatePath("/"); 
    revalidatePath("/admin"); 
    revalidatePath("/category/[category]", "page");

    const slugsToRevalidate = res?.affectedSlugs || validatedCategories.map((c) => c.slug);
    for (const slug of slugsToRevalidate) {
      if (slug) {
        revalidatePath(`/category/${slug}`);
      }
    }

    return {
      success: true,
      message: "ক্যাটাগরি ও উপ-বিভাগের পরিবর্তনগুলো সফলভাবে সংরক্ষিত হয়েছে!",
    };
  } catch (error) {
    return { success: false, message: formatZodError(error, "সংরক্ষণ সম্পন্ন করা যায়নি।") };
  }
}
