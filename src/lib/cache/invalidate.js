import { revalidateTag, revalidatePath } from "next/cache";
import { TAGS } from "./tags";

export function invalidateHomepage() {
  try {
    revalidateTag(TAGS.HOMEPAGE);
    revalidateTag(TAGS.ARTICLES_PUBLISHED);
    revalidatePath("/", "page");
    revalidatePath("/category/latest", "page");
  } catch (err) {
    console.error("invalidateHomepage error:", err);
  }
}

export function invalidateArticle(id, categorySlug, slug = null) {
  try {
    if (id) {
      revalidateTag(TAGS.ARTICLE(id));
      revalidatePath(`/article/${id}`, "page");
    }
    if (slug && slug !== id) {
      revalidateTag(TAGS.ARTICLE(slug));
      revalidatePath(`/article/${slug}`, "page");
    }
    if (categorySlug) {
      revalidateTag(TAGS.CATEGORY(categorySlug));
      revalidateTag(TAGS.ARTICLES_CATEGORY(categorySlug));
      revalidatePath(`/category/${categorySlug}`, "page");
    }
    revalidatePath("/category/latest", "page");
    revalidatePath("/", "page");
  } catch (err) {
    console.error("invalidateArticle error:", err);
  }
}

export function invalidateCuration(type) {
  try {
    revalidateTag(TAGS.HOMEPAGE);
    revalidatePath("/", "page");
    if (type === "breaking") {
      revalidateTag(TAGS.CURATION_BREAKING);
    } else if (type === "handpicked") {
      revalidateTag(TAGS.CURATION_HANDPICKED);
      revalidateTag(TAGS.CATEGORY("handpicked"));
      revalidateTag(TAGS.ARTICLES_CATEGORY("handpicked"));
      revalidatePath("/category/handpicked", "page");
    }
  } catch (err) {
    console.error("invalidateCuration error:", err);
  }
}

export function invalidateCategory(slug) {
  try {
    revalidateTag(TAGS.HOMEPAGE);
    revalidateTag(TAGS.CATEGORIES);
    revalidatePath("/", "page");
    if (slug) {
      revalidateTag(TAGS.CATEGORY(slug));
      revalidateTag(TAGS.ARTICLES_CATEGORY(slug));
      revalidatePath(`/category/${slug}`, "page");
    }
  } catch (err) {
    console.error("invalidateCategory error:", err);
  }
}

export function invalidateSocialLinks() {
  try {
    revalidateTag(TAGS.SOCIAL_LINKS);
  } catch (err) {
    console.error("invalidateSocialLinks error:", err);
  }
}

export function invalidateSiteSettings() {
  try {
    revalidateTag(TAGS.SITE_SETTINGS);
  } catch (err) {
    console.error("invalidateSiteSettings error:", err);
  }
}
