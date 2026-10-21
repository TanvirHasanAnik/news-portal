"use server";

import { revalidatePath } from "next/cache";
import { createArticle } from "@/repositories/articleRepository";
import { getCategoryBySlug, getAllCategoriesWithSubcategories } from "@/repositories/categoryRepository";
import { articleCreateSchema } from "@/schemas/articleSchema";

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
 * Catches user input from form, validates via Zod schema, maps data, and passes to Repository.
 */
export async function createArticleAction(prevState, formData) {
  try {
    const headline = formData.get("headline")?.toString() || "";
    const summary = formData.get("summary")?.toString() || "";
    const content = formData.get("content")?.toString() || "";
    const categorySlug = formData.get("categorySlug")?.toString() || "";
    const subcategoryName = formData.get("subcategoryName")?.toString() || "";
    
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

    const youtubeUrl = formData.get("youtubeUrl")?.toString() || "";
    const authorName = formData.get("authorName")?.toString().trim() || "নিজস্ব প্রতিবেদক";
    const location = formData.get("location")?.toString().trim() || "ঢাকা";
    const status = formData.get("status")?.toString().trim() || "published";
    const isBreaking = formData.get("isBreaking") === "true" || formData.get("isBreaking") === "on";
    const isLead = formData.get("isLead") === "true" || formData.get("isLead") === "on";
    const isHandpicked = formData.get("isHandpicked") === "true" || formData.get("isHandpicked") === "on";

    // Validate inputs via centralized Zod Article Schema
    const validationResult = articleCreateSchema.safeParse({
      headline,
      summary,
      content,
      categorySlug,
      subcategoryName,
      images,
      youtubeUrl,
      status,
      isBreaking,
      isLead,
      isHandpicked,
    });

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });

      return {
        success: false,
        errors: fieldErrors,
        message: "ফর্মের তথ্য যাচাইয়ে ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে লাল চিহ্নিত অংশগুলো সংশোধন করুন।",
      };
    }

    const validated = validationResult.data;

    // Resolve category details from Repository
    const category = await getCategoryBySlug(validated.categorySlug);
    const categoryName = category ? category.name : validated.categorySlug;
    const categoryId = category ? category.id : null;

    // Resolve subcategory ID if available
    let subcategoryId = null;
    if (category && validated.subcategoryName) {
      const allCats = await getAllCategoriesWithSubcategories();
      const currentCat = allCats.find((c) => c.slug === validated.categorySlug);
      const foundSub = currentCat?.subcategories?.find((s) => s.name === validated.subcategoryName);
      if (foundSub) {
        subcategoryId = foundSub.id;
      }
    }

    const slug = generateSlug(validated.headline);
    const readTime = calculateReadTime(validated.content);

    // Call Repository to write to Database (Raw D1)
    const result = await createArticle({
      headline: validated.headline,
      slug,
      summary: validated.summary || validated.headline.substring(0, 150),
      content: validated.content || "",
      categoryId,
      categoryName,
      categorySlug: validated.categorySlug,
      subcategoryId,
      subcategoryName: validated.subcategoryName || null,
      images: validated.images,
      image: primaryImage,
      youtubeUrl: validated.youtubeUrl || null,
      authorName,
      location,
      readTime,
      status: validated.status,
      isBreaking: validated.isBreaking,
      isLead: validated.isLead,
      isHandpicked: validated.isHandpicked,
    });

    // Revalidate paths
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/category/${validated.categorySlug}`);

    return {
      success: true,
      articleId: result.id,
      slug: result.slug,
      message: `সংবাদটি (${validated.status === "published" ? "প্রকাশিত" : "খসড়া হিসেবে সংরক্ষিত"}) সফলভাবে সম্পন্ন হয়েছে!`,
    };
  } catch (error) {
    console.error("createArticleAction error:", error);
    return {
      success: false,
      message: `সংবাদ সংরক্ষণে প্রযুক্তিগত সমস্যা: ${error.message}`,
    };
  }
}
