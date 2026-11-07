import { revalidateTag } from "next/cache";
import { TAGS } from "./tags";

export function invalidateHomepage() {
  revalidateTag(TAGS.HOMEPAGE);
  revalidateTag(TAGS.ARTICLES_PUBLISHED);
}

export function invalidateArticle(id, categorySlug, slug = null) {
  if (id) {
    revalidateTag(TAGS.ARTICLE(id));
  }
  if (slug && slug !== id) {
    revalidateTag(TAGS.ARTICLE(slug));
  }
  if (categorySlug) {
    revalidateTag(TAGS.CATEGORY(categorySlug));
    revalidateTag(TAGS.ARTICLES_CATEGORY(categorySlug));
  }
}

export function invalidateCuration(type) {
  revalidateTag(TAGS.HOMEPAGE);
  if (type === "breaking") {
    revalidateTag(TAGS.CURATION_BREAKING);
  } else if (type === "handpicked") {
    revalidateTag(TAGS.CURATION_HANDPICKED);
    revalidateTag(TAGS.CATEGORY("handpicked"));
    revalidateTag(TAGS.ARTICLES_CATEGORY("handpicked"));
  }
}

export function invalidateCategory(slug) {
  revalidateTag(TAGS.HOMEPAGE);
  revalidateTag(TAGS.CATEGORIES);
  if (slug) {
    revalidateTag(TAGS.CATEGORY(slug));
  }
}

export function invalidateSocialLinks() {
  revalidateTag(TAGS.SOCIAL_LINKS);
}

export function invalidateSiteSettings() {
  revalidateTag(TAGS.SITE_SETTINGS);
}
