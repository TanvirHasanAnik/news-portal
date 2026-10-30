"use server";

import { revalidatePath } from "next/cache";
import {
  createArticle,
  updateArticle,
  getArticleById,
  updateArticleStatus,
  passArticleToUpper,
  toggleArticleFlag,
  deleteArticle,
} from "@/repositories/articleRepository";
import { notifySubEditorsOfReporterArticle } from "@/repositories/notificationRepository";
import { getCategoryBySlug, getAllCategoriesWithSubcategories, ensureValidCategory } from "@/repositories/categoryRepository";
import { articleCreateSchema } from "@/schemas/articleSchema";
import { getCurrentUser } from "@/lib/auth/server";
import { isUpperRole, isLowerRole } from "@/config/roles";

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

function generateSlug(headline) {
  if (!headline) return `news-${Date.now()}`;

  const cleaned = headline
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .substring(0, 80);

  const suffix = Math.random().toString(36).substring(2, 6);
  return cleaned ? `${cleaned}-${suffix}` : `news-${Date.now()}-${suffix}`;
}

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
    const categorySlug = (formData.get("categorySlug")?.toString() || "").trim() || "others";
    const subcategoryName = formData.get("subcategoryName")?.toString() || "";

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
    const authorName = formData.get("authorName")?.toString().trim() || currentUser.fullName || currentUser.name || "নিজস্ব প্রতিবেদক";
    const location = formData.get("location")?.toString().trim() || "ঢাকা";

    let requestedStatus = formData.get("status")?.toString().trim() || "published";
    if (isLowerRole(currentUser.role)) {

      if (requestedStatus === "published") {
        requestedStatus = "pending";
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

    const category = await ensureValidCategory(null, validated.categorySlug);
    const categoryName = category.name;
    const categoryId = category.id;
    const resolvedCategorySlug = category.slug;

    let subcategoryId = null;
    let resolvedSubcategoryName = null;
    if (category.slug !== "others" && validated.subcategoryName) {
      const allCats = await getAllCategoriesWithSubcategories();
      const currentCat = allCats.find((c) => c.slug === resolvedCategorySlug);
      const foundSub = currentCat?.subcategories?.find((s) => s.name === validated.subcategoryName);
      if (foundSub) {
        subcategoryId = foundSub.id;
        resolvedSubcategoryName = foundSub.name;
      }
    }

    const slug = generateSlug(validated.headline);
    const readTime = calculateReadTime(validated.content);

    const result = await createArticle({
      headline: validated.headline,
      slug,
      summary: validated.summary || validated.headline.substring(0, 150),
      content: validated.content || "",
      categoryId,
      categoryName,
      categorySlug: resolvedCategorySlug,
      subcategoryId,
      subcategoryName: resolvedSubcategoryName,
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

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/category/${validated.categorySlug}`);

    if (currentUser.role === "reporter" && (validated.status === "pending" || validated.status === "pending_approval")) {
      try {
        await notifySubEditorsOfReporterArticle({
          articleId: result.id,
          headline: validated.headline,
          slug: result.slug,
          reporterUsername: currentUser.username,
        });
      } catch (notifErr) {
        console.error("Failed to notify sub-editors on article create:", notifErr);
      }
    }

    const statusLabels = {
      published: "প্রকাশিত",
      draft: "খসড়া হিসেবে সংরক্ষিত",
      pending: "অনুমোদনের জন্য জমা দেওয়া হয়েছে",
      rejected: "প্রত্যাখ্যাত",
    };

    const isPublished = validated.status === "published";

    return {
      success: true,
      articleId: result.id,
      slug: result.slug,
      status: validated.status,
      isPublished,
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

    const isAuthor =
      existingArticle.author_id === currentUser.id ||
      existingArticle.created_by === currentUser.username;

    if (currentUser.role === "reporter") {
      if (!isAuthor) {
        return {
          success: false,
          message: "অন্য কারো সংবাদ সম্পাদনা করার অনুমতি আপনার নেই।",
        };
      }
      if (existingArticle.status === "published") {
        return {
          success: false,
          message: "প্রকাশিত সংবাদ সম্পাদনা করার অনুমতি প্রতিবেদকের নেই।",
        };
      }
    } else if (currentUser.role === "sub_editor") {
      if (existingArticle.status === "published") {
        return {
          success: false,
          message: "প্রকাশিত সংবাদ সম্পাদনা করার অনুমতি সহ-সম্পাদকের নেই।",
        };
      }
      const isReporterSubmitted =
        (existingArticle.status === "pending" || existingArticle.status === "pending_approval") &&
        (existingArticle.author_role === "reporter" || existingArticle.created_by !== currentUser.username);

      if (!isAuthor && !isReporterSubmitted) {
        return {
          success: false,
          message: "কেবলমাত্র আপনার নিজের সংবাদ অথবা প্রতিবেদকদের জমাকৃত সংবাদ সম্পাদনা করার অনুমতি আপনার আছে।",
        };
      }
    }

    const headline = formData.get("headline")?.toString() || "";
    const summary = formData.get("summary")?.toString() || "";
    const content = formData.get("content")?.toString() || "";
    const categorySlug = formData.get("categorySlug")?.toString() || "";
    const subcategoryName = formData.get("subcategoryName")?.toString() || "";

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

    let targetStatus = formData.get("status")?.toString().trim() || existingArticle.status;
    if (isLowerRole(currentUser.role)) {

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

    const category = await ensureValidCategory(null, validated.categorySlug);
    const categoryName = category.name;
    const categoryId = category.id;
    const resolvedCategorySlug = category.slug;

    let subcategoryId = null;
    let resolvedSubcategoryName = null;
    if (category.slug !== "others" && validated.subcategoryName) {
      const allCats = await getAllCategoriesWithSubcategories();
      const currentCat = allCats.find((c) => c.slug === resolvedCategorySlug);
      const foundSub = currentCat?.subcategories?.find((s) => s.name === validated.subcategoryName);
      if (foundSub) {
        subcategoryId = foundSub.id;
        resolvedSubcategoryName = foundSub.name;
      }
    }

    const isSubEditorReview = currentUser.role === "sub_editor" && !isAuthor;
    const passToUpper = formData.get("passToUpper") === "true";
    const rejectionReason = (formData.get("rejectionReason") || "").toString().trim() || null;

    const readTime = calculateReadTime(validated.content);

    const updateResult = await updateArticle(articleId, {
      headline: validated.headline,
      summary: validated.summary || validated.headline.substring(0, 150),
      content: validated.content || "",
      categoryId,
      categoryName,
      categorySlug: resolvedCategorySlug,
      subcategoryId,
      subcategoryName: resolvedSubcategoryName,
      images: validated.images,
      image: primaryImage,
      youtubeUrl: validated.youtubeUrl || null,
      location,
      readTime,
      status: isSubEditorReview ? "pending" : validated.status,
      isBreaking: validated.isBreaking,
      isLead: validated.isLead,
      isHandpicked: validated.isHandpicked,
      lastEditedBy: currentUser.username,
      editorId: currentUser.id,
      changeSummary: `সংবাদ সম্পাদনা করেছেন: @${currentUser.username}`,
      passToUpper: isSubEditorReview ? passToUpper : false,
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/category/${validated.categorySlug}`);
    revalidatePath(`/article/${existingArticle.slug}`);

    if (
      currentUser.role === "reporter" &&
      targetStatus === "pending" &&
      existingArticle.status !== "pending" &&
      existingArticle.status !== "pending_approval"
    ) {
      try {
        await notifySubEditorsOfReporterArticle({
          articleId,
          headline: validated.headline,
          slug: existingArticle.slug,
          reporterUsername: currentUser.username,
        });
      } catch (notifErr) {
        console.error("Failed to notify sub-editors on article update:", notifErr);
      }
    }

    const statusLabels = {
      published: "প্রকাশিত",
      draft: "খসড়া হিসেবে সংরক্ষিত",
      pending: "অনুমোদনের জন্য জমা দেওয়া হয়েছে",
      rejected: "প্রত্যাখ্যাত",
      archived: "আর্কাইভকৃত",
    };

    const finalStatus = isSubEditorReview ? "pending" : validated.status;
    const isPublished = finalStatus === "published";

    let successMessage = `সংবাদটি (${statusLabels[validated.status] || validated.status}) সফলভাবে আপডেট হয়েছে!`;
    if (isSubEditorReview) {
      if (passToUpper) {
        successMessage = updateResult?.hasContentChanged
          ? "সংবাদটি সম্পাদিত আকারে সফলভাবে ঊর্ধ্বতন কর্তৃপক্ষের কাছে পাঠানো হয়েছে!"
          : "সংবাদটি অপরিবর্তিত আকারে সফলভাবে ঊর্ধ্বতন কর্তৃপক্ষের কাছে পাঠানো হয়েছে!";
      } else {
        successMessage = updateResult?.hasContentChanged
          ? "সম্পাদনা সফলভাবে সংরক্ষণ করা হয়েছে এবং প্রতিবেদকদের জমাকৃত তালিকায় সংরক্ষিত রয়েছে।"
          : "সংবাদে কোনো পরিবর্তন নেই; এটি প্রতিবেদকদের জমাকৃত তালিকায় সংরক্ষিত রয়েছে।";
      }
    }

    return {
      success: true,
      articleId,
      slug: existingArticle.slug,
      status: finalStatus,
      isPublished,
      hasContentChanged: updateResult?.hasContentChanged,
      lastEditedBy: updateResult?.lastEditedBy,
      message: successMessage,
    };
  } catch (error) {
    console.error("updateArticleAction error:", error);
    return {
      success: false,
      message: `সংবাদ আপডেটে সমস্যা: ${error.message}`,
    };
  }
}

export async function passArticleToUpperAction(articleId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "sub_editor") {
      return { success: false, message: "শুধুমাত্র সহ-সম্পাদক এই কাজটি করতে পারেন।" };
    }

    if (!articleId) {
      return { success: false, message: "আর্টিকেল আইডি পাওয়া যায়নি।" };
    }

    const article = await getArticleById(articleId);
    if (!article) {
      return { success: false, message: "সংবাদটি ডাটাবেজে পাওয়া যায়নি।" };
    }

    const isAuthor =
      article.author_id === currentUser.id ||
      article.created_by === currentUser.username;
    if (isAuthor) {
      return { success: false, message: "নিজের তৈরি সংবাদ সরাসরি পাস করা যাবে না, পর্যালোচনার জন্য জমা দিন।" };
    }

    await passArticleToUpper(articleId, currentUser.username);
    revalidatePath("/admin");

    return {
      success: true,
      message: "সংবাদটি সফলভাবে যাচাই করে ঊর্ধ্বতন কর্তৃপক্ষের কাছে পাঠানো হয়েছে।",
    };
  } catch (error) {
    console.error("passArticleToUpperAction error:", error);
    return { success: false, message: `সংবাদ পাস করতে সমস্যা: ${error.message}` };
  }
}

export async function updateArticleStatusAction(articleId, newStatus, rejectionReason = null) {
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

    const isAuthor =
      article.author_id === currentUser.id ||
      article.created_by === currentUser.username;

    if (currentUser.role === "reporter") {
      if (!isAuthor) {
        return { success: false, message: "অন্য কারো সংবাদের স্ট্যাটাস পরিবর্তনের অধিকার আপনার নেই।" };
      }
      if (newStatus !== "draft" && newStatus !== "pending") {
        return { success: false, message: "প্রতিবেদক হিসেবে আপনি শুধুমাত্র খসড়া বা পর্যালোচনার আবেদন করতে পারেন।" };
      }
    } else if (currentUser.role === "sub_editor") {
      if (!isAuthor) {
        const isReporterSubmitted =
          article.status === "pending" || article.status === "pending_approval";
        if (!isReporterSubmitted) {
          return { success: false, message: "অন্য কারো সংবাদের স্ট্যাটাস পরিবর্তনের অধিকার আপনার নেই।" };
        }

        if (newStatus !== "pending") {
          return {
            success: false,
            message: "সহ-সম্পাদক সরাসরি সংবাদ প্রকাশ বা বাতিল করতে পারেন না। এটি ঊর্ধ্বতন কর্তৃপক্ষের কাছে পাঠাতে হবে।",
          };
        }
      } else {
        if (newStatus !== "draft" && newStatus !== "pending") {
          return {
            success: false,
            message: "সহ-সম্পাদক হিসেবে নিজের সংবাদ শুধুমাত্র খসড়া রাখতে পারেন বা ঊর্ধ্বতনদের পর্যালোচনার জন্য জমা দিতে পারেন।",
          };
        }
      }
    }

        if (newStatus === "rejected" && article.status !== "pending" && article.status !== "pending_approval") {
      return {
        success: false,
        message: "শুধুমাত্র অনুমোদনের অপেক্ষায় থাকা (পেন্ডিং) সংবাদ প্রত্যাখ্যান করা যাবে।",
      };
    }

    const cleanReason = (rejectionReason || "").toString().trim() || null;
    await updateArticleStatus(articleId, newStatus, currentUser.id, currentUser.username, cleanReason);
    revalidatePath("/admin");
    revalidatePath("/");
    if (article.category_slug) {
      revalidatePath(`/category/${article.category_slug}`);
    }
    if (article.slug) {
      revalidatePath(`/article/${article.slug}`);
    }

    if (
      currentUser.role === "reporter" &&
      newStatus === "pending" &&
      article.status !== "pending" &&
      article.status !== "pending_approval"
    ) {
      try {
        await notifySubEditorsOfReporterArticle({
          articleId,
          headline: article.headline,
          slug: article.slug,
          reporterUsername: currentUser.username,
        });
      } catch (notifErr) {
        console.error("Failed to notify sub-editors on article status change:", notifErr);
      }
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

export async function toggleArticleFlagAction(articleId, flagName) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !isUpperRole(currentUser.role)) {
      return { success: false, message: "এই পরিবর্তন করার অনুমতি আপনার নেই।" };
    }
    const res = await toggleArticleFlag(articleId, flagName);
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/category/handpicked");
    return { success: true, active: res[flagName] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteArticleAction(articleId) {
  try {
    if (!articleId) {
      return { success: false, message: "আর্টিকেল আইডি আবশ্যক।" };
    }
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।" };
    }
    const allowedRoles = ["super_admin", "admin", "editor_in_chief", "editor"];
    if (!allowedRoles.includes(currentUser.role)) {
      return { success: false, message: "আর্টিকেল মুছে ফেলার অনুমতি আপনার নেই।" };
    }
    await deleteArticle(
      articleId,
      currentUser.id,
      currentUser.username
    );
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, message: "আর্টিকেলটি সফলভাবে মুছে ফেলা হয়েছে।" };
  } catch (error) {
    return { success: false, message: `মুছে ফেলা সম্ভব হয়নি: ${error.message}` };
  }
}

