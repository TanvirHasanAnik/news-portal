import { getAllCategories } from "@/repositories/categoryRepository";
import { getPublishedArticlesForSitemap } from "@/repositories/articleRepository";

export const dynamic = "force-dynamic";

const BASE_URL = "https://aloashbe.com";

const DEFAULT_CATEGORY_SLUGS = [
  "latest",
  "handpicked",
  "national",
  "politics",
  "economy",
  "international",
  "sports",
  "entertainment",
  "technology",
  "lifestyle",
  "career",
  "opinion",
  "others",
];

function toValidDate(value) {
  if (!value) return new Date();
  const date = new Date(value);
  return isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap() {
  let categories = [];
  try {
    categories = await getAllCategories();
  } catch (error) {
    console.error("Failed to load categories for sitemap:", error);
  }

  let articles = [];
  try {
    articles = await getPublishedArticlesForSitemap();
  } catch (error) {
    console.error("Failed to load articles for sitemap:", error);
  }

  const categoryEntriesMap = new Map();

  for (const slug of DEFAULT_CATEGORY_SLUGS) {
    categoryEntriesMap.set(slug, {
      url: `${BASE_URL}/category/${encodeURI(slug)}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    });
  }

  if (Array.isArray(categories)) {
    for (const cat of categories) {
      if (!cat?.slug) continue;
      categoryEntriesMap.set(cat.slug, {
        url: `${BASE_URL}/category/${encodeURI(cat.slug)}`,
        lastModified: toValidDate(cat.updated_at || cat.created_at),
        changeFrequency: "hourly",
        priority: 0.8,
      });
    }
  }

  const latestArticleDate =
    Array.isArray(articles) && articles.length > 0
      ? toValidDate(articles[0].updated_at || articles[0].created_at)
      : new Date();

  const homeEntry = {
    url: BASE_URL,
    lastModified: latestArticleDate,
    changeFrequency: "always",
    priority: 1.0,
  };

  const articleEntries = [];
  if (Array.isArray(articles)) {
    for (const art of articles) {
      const identifier = art.slug || art.id;
      if (!identifier) continue;
      articleEntries.push({
        url: `${BASE_URL}/article/${encodeURI(identifier)}`,
        lastModified: toValidDate(art.updated_at || art.created_at),
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  const staticEntries = [
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [
    homeEntry,
    ...staticEntries,
    ...Array.from(categoryEntriesMap.values()),
    ...articleEntries,
  ];
}
