function safeTag(prefix, val) {
  if (!val) return prefix;
  let str = String(val);
  try {
    str = decodeURIComponent(str);
  } catch {}
  if (str.length > 150) {
    str = str.slice(0, 150);
  }
  return `${prefix}:${str}`;
}

export const TAGS = {
  HOMEPAGE: "homepage",
  ARTICLES_PUBLISHED: "articles:published",
  ARTICLE: (id) => safeTag("article", id),
  CATEGORY: (slug) => safeTag("category", slug),
  ARTICLES_CATEGORY: (slug) => safeTag("articles:category", slug),
  CATEGORIES: "categories",
  CURATION_BREAKING: "curation:breaking",
  CURATION_HANDPICKED: "curation:handpicked",
  SOCIAL_LINKS: "social-links",
  SITE_SETTINGS: "site-settings",
};