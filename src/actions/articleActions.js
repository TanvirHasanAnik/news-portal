"use server";

import { revalidatePath } from "next/cache";
import {
  createArticle,
  updateArticle,
  getArticleById,
  updateArticleStatus,
  toggleArticleFlag,
  deleteArticle,
  getArticleRevisions,
} from "@/repositories/articleRepository";
import { getCategoryBySlug, getAllCategoriesWithSubcategories } from "@/repositories/categoryRepository";
import { articleCreateSchema } from "@/schemas/articleSchema";
import { getCurrentUser } from "@/lib/auth/server";
import { isUpperRole, isLowerRole } from "@/config/roles";

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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: "অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।",
      };
    }

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
    const authorName = formData.get("authorName")?.toString().trim() || currentUser.fullName || currentUser.name || "নিজস্ব প্রতিবেদক";
    const location = formData.get("location")?.toString().trim() || "ঢাকা";
    
    // Workflow State resolution based on role
    let requestedStatus = formData.get("status")?.toString().trim() || "published";
    if (isLowerRole(currentUser.role)) {
      // Lower roles (Reporter / Sub-Editor) can only save as draft or submit for review (pending)
      if (requestedStatus === "published") {
        requestedStatus = "pending";
      }
    }

    const isBreaking = (formData.get("isBreaking") === "true" || formData.get("isBreaking") === "on") && isUpperRole(currentUser.role);
    const isLead = (formData.get("isLead") === "true" || formData.get("isLead") === "on") && isUpperRole(currentUser.role);
    const isHandpicked = (formData.get("isHandpicked") === "true" || formData.get("isHandpicked") === "on") && isUpperRole(currentUser.role);

    // Validate inputs via centralized Zod Article Schema
    const validationResult = articleCreateSchema.safeParse({
      headline,
      summary,
      content,
      categorySlug,
      subcategoryName,
      images,
      youtubeUrl,
      status: requestedStatus,
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

    // Call Repository to write to Database
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
      authorId: currentUser.id,
      authorName,
      createdBy: currentUser.username,
      lastEditedBy: currentUser.username,
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

    const statusLabels = {
      published: "প্রকাশিত",
      draft: "খসড়া হিসেবে সংরক্ষিত",
      pending: "অনুমোদনের জন্য জমা দেওয়া হয়েছে",
      rejected: "প্রত্যাখ্যাত",
    };

    return {
      success: true,
      articleId: result.id,
      slug: result.slug,
      message: `সংবাদটি (${statusLabels[validated.status] || validated.status}) সফলভাবে সম্পন্ন হয়েছে!`,
    };
  } catch (error) {
    console.error("createArticleAction error:", error);
    return {
      success: false,
      message: `সংবাদ সংরক্ষণে প্রযুক্তিগত সমস্যা: ${error.message}`,
    };
  }
}

/**
 * Server Action: Update an existing article
 * Upper roles can edit any article in any state; lower roles can only edit their own.
 * Updates last_edited_by automatically on success.
 */
export async function updateArticleAction(prevState, formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: "অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।",
      };
    }

    const articleId = formData.get("articleId")?.toString();
    if (!articleId) {
      return { success: false, message: "আর্টিকেল আইডি পাওয়া যায়নি।" };
    }

    const existingArticle = await getArticleById(articleId);
    if (!existingArticle) {
      return { success: false, message: "আর্টিকেলটি ডাটাবেজে খুঁজে পাওয়া যায়নি।" };
    }

    // RBAC Check:
    // Upper roles: full permission to edit any article in any state authored by anyone
    // Lower roles: can ONLY edit their own articles
    if (isLowerRole(currentUser.role)) {
      const isAuthor =
        existingArticle.author_id === currentUser.id ||
        existingArticle.created_by === currentUser.username;
      if (!isAuthor) {
        return {
          success: false,
          message: "অন্য কারো সংবাদ সম্পাদনা করার অনুমতি আপনার নেই।",
        };
      }
    }

    const headline = formData.get("headline")?.toString() || "";
    const summary = formData.get("summary")?.toString() || "";
    const content = formData.get("content")?.toString() || "";
    const categorySlug = formData.get("categorySlug")?.toString() || "";
    const subcategoryName = formData.get("subcategoryName")?.toString() || "";

    // Parse images
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
    images = images.slice(0, 3);
    const primaryImage = images[0] || null;

    const youtubeUrl = formData.get("youtubeUrl")?.toString() || "";
    const location = formData.get("location")?.toString().trim() || existingArticle.location || "ঢাকা";

    // Workflow state resolution
    let targetStatus = formData.get("status")?.toString().trim() || existingArticle.status;
    if (isLowerRole(currentUser.role)) {
      // Lower roles can only transition to draft or pending review
      if (targetStatus !== "draft") {
        targetStatus = "pending";
      }
    }

    const isBreaking = (formData.get("isBreaking") === "true" || formData.get("isBreaking") === "on") && isUpperRole(currentUser.role);
    const isLead = (formData.get("isLead") === "true" || formData.get("isLead") === "on") && isUpperRole(currentUser.role);
    const isHandpicked = (formData.get("isHandpicked") === "true" || formData.get("isHandpicked") === "on") && isUpperRole(currentUser.role);

    const validationResult = articleCreateSchema.safeParse({
      headline,
      summary,
      content,
      categorySlug,
      subcategoryName,
      images,
      youtubeUrl,
      status: targetStatus,
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
        message: "ফর্মের তথ্য যাচাইয়ে ত্রুটি দেখা দিয়েছে। লাল অংশগুলো সংশোধন করুন।",
      };
    }

    const validated = validationResult.data;

    const category = await getCategoryBySlug(validated.categorySlug);
    const categoryName = category ? category.name : validated.categorySlug;
    const categoryId = category ? category.id : null;

    let subcategoryId = null;
    if (category && validated.subcategoryName) {
      const allCats = await getAllCategoriesWithSubcategories();
      const currentCat = allCats.find((c) => c.slug === validated.categorySlug);
      const foundSub = currentCat?.subcategories?.find((s) => s.name === validated.subcategoryName);
      if (foundSub) {
        subcategoryId = foundSub.id;
      }
    }

    const readTime = calculateReadTime(validated.content);

    await updateArticle(articleId, {
      headline: validated.headline,
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
      location,
      readTime,
      status: validated.status,
      isBreaking: validated.isBreaking,
      isLead: validated.isLead,
      isHandpicked: validated.isHandpicked,
      lastEditedBy: currentUser.username,
      editorId: currentUser.id,
      changeSummary: `সংবাদ সম্পাদনা করেছেন: @${currentUser.username}`,
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/category/${validated.categorySlug}`);
    revalidatePath(`/article/${existingArticle.slug}`);

    const statusLabels = {
      published: "প্রকাশিত",
      draft: "খসড়া হিসেবে সংরক্ষিত",
      pending: "অনুমোদনের জন্য জমা দেওয়া হয়েছে",
      rejected: "প্রত্যাখ্যাত",
      archived: "আর্কাইভকৃত",
    };

    return {
      success: true,
      articleId,
      slug: existingArticle.slug,
      message: `সংবাদটি (${statusLabels[validated.status] || validated.status}) সফলভাবে আপডেট হয়েছে!`,
    };
  } catch (error) {
    console.error("updateArticleAction error:", error);
    return {
      success: false,
      message: `সংবাদ আপডেটে সমস্যা: ${error.message}`,
    };
  }
}

/**
 * Server Action: Update article status (published, draft, pending, rejected, archived)
 * Upper roles can approve, publish, reject, or archive any article.
 * Lower roles can only change their own articles between draft and pending review.
 */
export async function updateArticleStatusAction(articleId, newStatus) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।" };
    }

    if (!articleId || !newStatus) {
      return { success: false, message: "আর্টিকেল আইডি এবং স্ট্যাটাস আবশ্যক।" };
    }

    const article = await getArticleById(articleId);
    if (!article) {
      return { success: false, message: "আর্টিকেলটি ডাটাবেজে পাওয়া যায়নি।" };
    }

    // Role-based status transition checks:
    if (isLowerRole(currentUser.role)) {
      const isAuthor =
        article.author_id === currentUser.id ||
        article.created_by === currentUser.username;
      if (!isAuthor) {
        return { success: false, message: "অন্য কারো সংবাদের স্ট্যাটাস পরিবর্তনের অধিকার আপনার নেই।" };
      }
      if (newStatus !== "draft" && newStatus !== "pending") {
        return { success: false, message: "প্রতিবেদক হিসেবে আপনি শুধুমাত্র খসড়া বা পর্যালোচনার আবেদন করতে পারেন।" };
      }
    }

    await updateArticleStatus(articleId, newStatus, currentUser.id, currentUser.username);
    revalidatePath("/admin");
    revalidatePath("/");
    if (article.category_slug) {
      revalidatePath(`/category/${article.category_slug}`);
    }
    if (article.slug) {
      revalidatePath(`/article/${article.slug}`);
    }

    const statusLabels = {
      published: "প্রকাশিত ও অনুমোদিত",
      draft: "খসড়া",
      pending: "পর্যালোচনার অপেক্ষায়",
      rejected: "প্রত্যাখ্যাত",
      archived: "আর্কাইভকৃত",
    };

    return {
      success: true,
      message: `সংবাদের অবস্থা সফলভাবে "${statusLabels[newStatus] || newStatus}" করা হয়েছে।`,
    };
  } catch (error) {
    return { success: false, message: `স্ট্যাটাস পরিবর্তন ব্যর্থ: ${error.message}` };
  }
}

/**
 * Server Action: Fetch revisions for a given article
 */
export async function getArticleRevisionsAction(articleId) {
  try {
    if (!articleId) return { success: false, revisions: [] };
    const revs = await getArticleRevisions(articleId);
    return { success: true, revisions: revs };
  } catch (error) {
    return { success: false, revisions: [], error: error.message };
  }
}

/**
 * Server Action: Toggle article flag (is_breaking, is_lead, is_handpicked)
 */
export async function toggleArticleFlagAction(articleId, flagName) {
  try {
    const res = await toggleArticleFlag(articleId, flagName);
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/category/handpicked");
    return { success: true, active: res[flagName] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Server Action: Delete an article
 */
export async function deleteArticleAction(articleId) {
  try {
    if (!articleId) {
      return { success: false, message: "আর্টিকেল আইডি আবশ্যক।" };
    }
    await deleteArticle(articleId);
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, message: "আর্টিকেলটি সফলভাবে মুছে ফেলা হয়েছে।" };
  } catch (error) {
    return { success: false, message: `মুছে ফেলা সম্ভব হয়নি: ${error.message}` };
  }
}

