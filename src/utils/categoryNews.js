import {
  categories,
  categoryNewsData,
  opinionArticles,
  latestMixedNews,
} from "../data/newsData";
import { temporaryNewsList, getSortedNewsByTime } from "../data/temporaryNewsData";
import { handpickedNewsList } from "../data/handpickedNewsData";

/**
 * Normalizes an article to a standard format for rendering
 */
function normalizeArticle(item, defaultCategory, defaultSlug) {
  return {
    id: item.id,
    headline: item.headline || item.title || "",
    summary: item.summary || item.excerpt || "",
    image:
      item.image ||
      item.avatar ||
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop",
    category: item.category || defaultCategory,
    categorySlug: item.categorySlug || defaultSlug,
    subcategory: defaultSlug === "latest" ? "" : (item.subcategory || ""),
    publishedAt: item.publishedAt || (item.time ? String(item.time) : "আজকের সংবাদ"),
    time: item.time,
    author: item.author || "নিজস্ব প্রতিবেদক",
    location: item.location || "ঢাকা",
    isMostRecent: Boolean(item.isMostRecent),
  };
}

/**
 * Returns category metadata and news list for any slug
 */
export function getCategoryNews(categorySlug) {
  if (!categorySlug) {
    return {
      slug: "",
      name: "বিভাগ",
      subcategories: [],
      articles: [],
      totalCount: 0,
    };
  }

  const decodedSlug = decodeURIComponent(categorySlug).toLowerCase();

  // Find predefined category if exists
  const matchedCategory = categories.find(
    (c) => c.slug.toLowerCase() === decodedSlug || c.id.toLowerCase() === decodedSlug
  );

  let categoryName = matchedCategory ? matchedCategory.name : "";

  // Check if any articles in temporary or handpicked have this category name
  if (!categoryName) {
    const tempMatch = temporaryNewsList.find((i) => i.categorySlug === decodedSlug);
    if (tempMatch) categoryName = tempMatch.category;
  }
  if (!categoryName) {
    const handpickedMatch = handpickedNewsList.find((i) => i.categorySlug === decodedSlug);
    if (handpickedMatch) categoryName = handpickedMatch.category;
  }
  if (!categoryName) {
    categoryName = decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1);
  }

  const articles = [];
  const seenIds = new Set();

  if (decodedSlug === "latest") {
    // 1. All latest news sorted by time
    const sortedTemp = getSortedNewsByTime(temporaryNewsList);
    sortedTemp.forEach((item) => {
      if (!seenIds.has(item.id)) {
        articles.push(normalizeArticle(item, item.category || "সর্বশেষ", "latest"));
        seenIds.add(item.id);
      }
    });

    // Also include latest mixed news
    latestMixedNews.forEach((item) => {
      if (!seenIds.has(item.id)) {
        articles.push(normalizeArticle(item, item.category || "সর্বশেষ", "latest"));
        seenIds.add(item.id);
      }
    });

    // Also include from each category's first item
    Object.entries(categoryNewsData).forEach(([slug, list]) => {
      if (list && list[0] && !seenIds.has(list[0].id)) {
        articles.push(normalizeArticle(list[0], list[0].category || "সর্বশেষ", slug));
        seenIds.add(list[0].id);
      }
    });
  } else if (decodedSlug === "opinion") {
    // Category news for opinion if available
    if (categoryNewsData.opinion) {
      categoryNewsData.opinion.forEach((item) => {
        if (!seenIds.has(item.id)) {
          articles.push(normalizeArticle(item, "মতামত", "opinion"));
          seenIds.add(item.id);
        }
      });
    }

    // Also adapt opinionArticles
    opinionArticles.forEach((op) => {
      if (!seenIds.has(op.id)) {
        articles.push({
          id: op.id,
          headline: op.title,
          summary: `${op.author} (${op.designation}) এর বিশেষ কলাম।`,
          image: op.avatar,
          category: "মতামত",
          categorySlug: "opinion",
          subcategory: op.time.includes("সম্পাদকীয়") ? "সম্পাদকীয়" : "কলাম",
          publishedAt: op.time,
          time: op.time,
          author: op.author,
          location: "সম্পাদকীয়",
          isMostRecent: false,
        });
        seenIds.add(op.id);
      }
    });
  } else {
    // Standard category
    // 1. From categoryNewsData
    const catList = categoryNewsData[decodedSlug] || [];
    catList.forEach((item) => {
      if (!seenIds.has(item.id)) {
        articles.push(normalizeArticle(item, categoryName, decodedSlug));
        seenIds.add(item.id);
      }
    });

    // 2. From temporaryNewsList
    temporaryNewsList.forEach((item) => {
      if (item.categorySlug === decodedSlug && !seenIds.has(item.id)) {
        articles.push(normalizeArticle(item, categoryName, decodedSlug));
        seenIds.add(item.id);
      }
    });

    // 3. From handpickedNewsList
    handpickedNewsList.forEach((item) => {
      if (item.categorySlug === decodedSlug && !seenIds.has(item.id)) {
        articles.push(normalizeArticle(item, categoryName, decodedSlug));
        seenIds.add(item.id);
      }
    });
  }

  // Dynamically extract all unique subcategories present in this category's news objects
  const dynamicSubcategories = Array.from(
    new Set(articles.map((a) => a.subcategory).filter(Boolean))
  );

  // Combine dynamic subcategories from actual news data with any defined category subcategories (omit for latest)
  const subcategories =
    decodedSlug === "latest"
      ? []
      : Array.from(
          new Set([...dynamicSubcategories, ...(matchedCategory?.subcategories || [])])
        );

  return {
    slug: decodedSlug,
    name: categoryName,
    subcategories,
    articles,
    totalCount: articles.length,
  };
}

/**
 * Returns all available category slugs for static generation
 */
export function getAllCategorySlugs() {
  const slugs = new Set(categories.map((c) => c.slug));
  temporaryNewsList.forEach((item) => {
    if (item.categorySlug) slugs.add(item.categorySlug);
  });
  handpickedNewsList.forEach((item) => {
    if (item.categorySlug) slugs.add(item.categorySlug);
  });
  return Array.from(slugs);
}

