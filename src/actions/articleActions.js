"use server";

import { revalidatePath } from "next/cache";
import { createArticle } from "@/repositories/articleRepository";
import { getCategoryBySlug, getAllCategoriesWithSubcategories } from "@/repositories/categoryRepository";

/**
 * Helper to calculate estimated read time in Bengali
 */
function calculateReadTime(text) {
  if (!text) return "১ মিনিট পাঠ";
  let plainText = text;
  try {
    const parsed = JSON.parse(text);
    if (parsed?.blocks && Array.isArray(parsed.blocks)) {
      plainText = parsed.blocks
        .map((b) => b.text || (b.items ? b.items.map((i) => i.text).join(" ") : ""))
        .join(" ");
    }
  } catch {}

  const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 180));
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const bnMinutes = String(minutes)
    .split("")
    .map((d) => banglaDigits[Number(d)] || d)
    .join("");
  return `${bnMinutes} মিনিট পাঠ`;
}

/**
 * Generates an SEO friendly slug with fallback to random id
 */
function generateSlug(headline) {
  if (!headline) return `news-${Date.now()}`;
  // Clean special characters while retaining Bengali and alphanumeric characters
  const cleaned = headline
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .substring(0, 80);

  const suffix = Math.random().toString(36).substring(2, 6);
  return cleaned ? `${cleaned}-${suffix}` : `news-${Date.now()}-${suffix}`;
}

/**
 * Server Action: Create a new article
 * Catches user input from form, validates, maps data, and passes to Repository.
 */
export async function createArticleAction(prevState, formData) {
  try {
    const headline = formData.get("headline")?.toString().trim();
    const summary = formData.get("summary")?.toString().trim() || "";
    const content = formData.get("content")?.toString().trim();
    const categorySlug = formData.get("categorySlug")?.toString().trim();
    const subcategoryName = formData.get("subcategoryName")?.toString().trim() || "";
    
    // Parse images array (max 3 images)
    let images = [];
    const rawImages = formData.get("images");
    if (rawImages) {
      try {
        const parsed = JSON.parse(rawImages.toString());
        if (Array.isArray(parsed)) {
          images = parsed.filter(Boolean);
        } else if (parsed) {
          images = [parsed.toString()];
        }
      } catch {
        images = [rawImages.toString().trim()];
      }
    }
    const singleImage = formData.get("image")?.toString().trim();
    if (images.length === 0 && singleImage) {
      images = [singleImage];
    }
    // Restrict strictly to maximum 3 images
    images = images.slice(0, 3);
    const primaryImage = images[0] || null;

    const youtubeUrl = formData.get("youtubeUrl")?.toString().trim() || "";
    const authorName = formData.get("authorName")?.toString().trim() || "নিজস্ব প্রতিবেদক";
    const location = formData.get("location")?.toString().trim() || "ঢাকা";
    const status = formData.get("status")?.toString().trim() || "published";
    const isBreaking = formData.get("isBreaking") === "true" || formData.get("isBreaking") === "on";
    const isLead = formData.get("isLead") === "true" || formData.get("isLead") === "on";
    const isHandpicked = formData.get("isHandpicked") === "true" || formData.get("isHandpicked") === "on";

    // Validation
    const errors = {};
    if (!headline || headline.length < 3) {
      errors.headline = "অন্তত ৩ অক্ষরের একটি শিরোনাম লিখুন।";
    }

    let plainContent = content || "";
    try {
      const parsed = JSON.parse(content);
      if (parsed?.blocks && Array.isArray(parsed.blocks)) {
        plainContent = parsed.blocks
          .map((b) => b.text || (b.items ? b.items.map((i) => i.text).join(" ") : ""))
          .join(" ")
          .trim();
      }
    } catch {}

    // Additional strict validations required for publishing, but flexible for drafts
    if (status !== "draft") {
      if (!headline || headline.length < 5) {
        errors.headline = "শিরোনামটি অন্তত ৫ অক্ষরের হতে হবে।";
      }
      if (!plainContent || plainContent.length < 20) {
        errors.content = "সংবাদের বিস্তারিত বিবরণ অন্তত ২০ অক্ষরের হতে হবে।";
      }
      if (!categorySlug) {
        errors.category = "অনুগ্রহ করে একটি বিভাগ নির্বাচন করুন।";
      }
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
        message: "ফর্মের তথ্য যাচাইয়ে ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে লাল চিহ্নিত অংশগুলো পূরণ করুন।",
      };
    }

    // Resolve category details from Repository
    const category = await getCategoryBySlug(categorySlug);
    const categoryName = category ? category.name : categorySlug;
    const categoryId = category ? category.id : null;

    // Resolve subcategory ID if available
    let subcategoryId = null;
    if (category && subcategoryName) {
      const allCats = await getAllCategoriesWithSubcategories();
      const currentCat = allCats.find((c) => c.slug === categorySlug);
      const foundSub = currentCat?.subcategories?.find((s) => s.name === subcategoryName);
      if (foundSub) {
        subcategoryId = foundSub.id;
      }
    }

    const slug = generateSlug(headline);
    const readTime = calculateReadTime(content);

    // Call Repository to write to Database (Raw D1)
    const result = await createArticle({
      headline,
      slug,
      summary: summary || headline.substring(0, 150),
      content,
      categoryId,
      categoryName,
      categorySlug,
      subcategoryId,
      subcategoryName: subcategoryName || null,
      images,
      image: primaryImage,
      youtubeUrl: youtubeUrl || null,
      authorName,
      location,
      readTime,
      status,
      isBreaking,
      isLead,
      isHandpicked,
    });

    // Revalidate paths
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/category/${categorySlug}`);

    return {
      success: true,
      articleId: result.id,
      slug: result.slug,
      message: `সংবাদটি (${status === "published" ? "প্রকাশিত" : "খসড়া হিসেবে সংরক্ষিত"}) সফলভাবে সম্পন্ন হয়েছে!`,
    };
  } catch (error) {
    console.error("createArticleAction error:", error);
    return {
      success: false,
      message: `সংবাদ সংরক্ষণে প্রযুক্তিগত সমস্যা: ${error.message}`,
    };
  }
}

