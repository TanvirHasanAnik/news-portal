"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory,
} from "@/repositories/categoryRepository";

export async function createCategoryAction(prevState, formData) {
  try {
    const name = formData.get("name")?.toString().trim();
    const slug = formData.get("slug")?.toString().trim().toLowerCase();
    const sortOrder = parseInt(formData.get("sortOrder")?.toString() || "0", 10);

    if (!name) {
      return { success: false, message: "ক্যাটাগরির নাম আবশ্যক।" };
    }
    if (!slug) {
      return { success: false, message: "ক্যাটাগরির ইংরেজি স্লাগ (Slug) আবশ্যক।" };
    }

    await createCategory({ name, slug, sortOrder });
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, message: `"${name}" ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে!` };
  } catch (error) {
    return { success: false, message: `ক্যাটাগরি তৈরিতে ত্রুটি: ${error.message}` };
  }
}

export async function deleteCategoryAction(categoryId) {
  try {
    if (!categoryId) {
      return { success: false, message: "ক্যাটাগরি আইডি আবশ্যক।" };
    }
    await deleteCategory(categoryId);
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, message: "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function createSubcategoryAction(prevState, formData) {
  try {
    const categoryId = formData.get("categoryId")?.toString().trim();
    const name = formData.get("name")?.toString().trim();
    const slug = formData.get("slug")?.toString().trim().toLowerCase();
    const sortOrder = parseInt(formData.get("sortOrder")?.toString() || "0", 10);

    if (!categoryId) {
      return { success: false, message: "মূল ক্যাটাগরি নির্বাচন করুন।" };
    }
    if (!name) {
      return { success: false, message: "সাব-ক্যাটাগরির নাম আবশ্যক।" };
    }
    if (!slug) {
      return { success: false, message: "সাব-ক্যাটাগরির স্লাগ আবশ্যক।" };
    }

    await createSubcategory({ categoryId, name, slug, sortOrder });
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, message: `"${name}" সাব-ক্যাটাগরি সফলভাবে যোগ করা হয়েছে!` };
  } catch (error) {
    return { success: false, message: `সাব-ক্যাটাগরি যোগে ত্রুটি: ${error.message}` };
  }
}

export async function deleteSubcategoryAction(subcategoryId) {
  try {
    if (!subcategoryId) {
      return { success: false, message: "সাব-ক্যাটাগরি আইডি আবশ্যক।" };
    }
    await deleteSubcategory(subcategoryId);
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, message: "সাব-ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

