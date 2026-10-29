import { handpickedNewsList } from "../data/handpickedNewsData";
import {
  categories,
  categoryNewsData,
  latestMixedNews,
  leadStory,
  opinionArticles,
  secondaryLeads,
  trendingNews,
} from "../data/newsData";
import { getSortedNewsByTime, temporaryNewsList } from "../data/temporaryNewsData";
import { getYouTubeThumbnail } from "./imageUtils";

export const categoryAccentMap = {
  national: "from-red-600 to-rose-700 bg-red-600 border-red-600 text-red-600",
  politics: "from-blue-600 to-indigo-700 bg-blue-600 border-blue-600 text-blue-600",
  economy: "from-emerald-600 to-teal-700 bg-emerald-600 border-emerald-600 text-emerald-600",
  international: "from-purple-600 to-violet-700 bg-purple-600 border-purple-600 text-purple-600",
  sports: "from-amber-600 to-orange-700 bg-amber-600 border-amber-600 text-amber-600",
  entertainment: "from-pink-600 to-rose-700 bg-pink-600 border-pink-600 text-pink-600",
  technology: "from-cyan-600 to-blue-700 bg-cyan-600 border-cyan-600 text-cyan-600",
  lifestyle: "from-lime-600 to-emerald-700 bg-lime-600 border-lime-600 text-lime-600",
  opinion: "from-slate-700 to-slate-900 bg-slate-800 border-slate-800 text-slate-800",
  latest: "from-red-700 to-red-900 bg-red-700 border-red-700 text-red-700",
  handpicked: "from-red-600 to-rose-700 bg-red-600 border-red-600 text-red-600",
};

export function normalizeArticle(item, defaultCategory = "জাতীয়", defaultSlug = "national") {
  const youtubeUrl = item.youtubeUrl || item.youtubeEmbed || item.videoUrl || item.youtube || null;
  const youtubeThumb = youtubeUrl ? getYouTubeThumbnail(youtubeUrl) : null;
  const hasCustomImage = Boolean(item.image && typeof item.image === "string" && item.image.trim());

  const resolvedImage = hasCustomImage
    ? item.image
    : (youtubeThumb || item.avatar || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop");

  return {
    id: String(item.id),
    headline: item.headline || item.title || "",
    summary: item.summary || item.excerpt || "",
    image: resolvedImage,
    hasCustomImage,
    youtubeUrl,
    category: item.category || defaultCategory,
    categorySlug: item.categorySlug || defaultSlug,
    subcategory: defaultSlug === "latest" ? "" : (item.subcategory || ""),
    publishedAt: item.publishedAt || (item.time ? String(item.time) : "আজকের সংবাদ"),
    time: item.time,
    author: item.author || "নিজস্ব প্রতিবেদক",
    location: item.location || "ঢাকা",
    isMostRecent: Boolean(item.isMostRecent),
    content: item.content !== undefined ? item.content : null,
    hasDetailedText:
      item.hasDetailedText !== undefined
        ? item.hasDetailedText
        : Array.isArray(item.content) && item.content.length === 0
        ? false
        : true,
  };
}

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

  let decodedSlug = categorySlug;
  try {
    decodedSlug = decodeURIComponent(categorySlug).toLowerCase();
  } catch {
    decodedSlug = String(categorySlug).toLowerCase();
  }

  const matchedCategory = categories.find(
    (c) => c.slug.toLowerCase() === decodedSlug || c.id.toLowerCase() === decodedSlug
  );

  let categoryName = matchedCategory ? matchedCategory.name : "";

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

    const sortedTemp = getSortedNewsByTime(temporaryNewsList);
    sortedTemp.forEach((item) => {
      if (!seenIds.has(item.id)) {
        articles.push(normalizeArticle(item, item.category || "সর্বশেষ", "latest"));
        seenIds.add(item.id);
      }
    });

    latestMixedNews.forEach((item) => {
      if (!seenIds.has(item.id)) {
        articles.push(normalizeArticle(item, item.category || "সর্বশেষ", "latest"));
        seenIds.add(item.id);
      }
    });

    Object.entries(categoryNewsData).forEach(([slug, list]) => {
      if (list && list[0] && !seenIds.has(list[0].id)) {
        articles.push(normalizeArticle(list[0], list[0].category || "সর্বশেষ", slug));
        seenIds.add(list[0].id);
      }
    });
  } else if (decodedSlug === "handpicked") {

    handpickedNewsList.forEach((item) => {
      if (!seenIds.has(item.id)) {
        const article = normalizeArticle(item, "বাছাইকৃত সংবাদ", "handpicked");
        articles.push({
          ...article,
          category: "বাছাইকৃত সংবাদ",
          categorySlug: "handpicked",
          subcategory: item.category || article.subcategory || "",
          originalCategory: item.category,
        });
        seenIds.add(item.id);
      }
    });
  } else if (decodedSlug === "opinion") {

    if (categoryNewsData.opinion) {
      categoryNewsData.opinion.forEach((item) => {
        if (!seenIds.has(item.id)) {
          articles.push(normalizeArticle(item, "মতামত", "opinion"));
          seenIds.add(item.id);
        }
      });
    }

    opinionArticles.forEach((op) => {
      if (!seenIds.has(op.id)) {
        articles.push({
          id: String(op.id),
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
          content: op.content || null,
        });
        seenIds.add(op.id);
      }
    });
  } else {

    const catList = categoryNewsData[decodedSlug] || [];
    catList.forEach((item) => {
      if (!seenIds.has(item.id)) {
        articles.push(normalizeArticle(item, categoryName, decodedSlug));
        seenIds.add(item.id);
      }
    });

    temporaryNewsList.forEach((item) => {
      if (item.categorySlug === decodedSlug && !seenIds.has(item.id)) {
        articles.push(normalizeArticle(item, categoryName, decodedSlug));
        seenIds.add(item.id);
      }
    });

    handpickedNewsList.forEach((item) => {
      if (item.categorySlug === decodedSlug && !seenIds.has(item.id)) {
        articles.push(normalizeArticle(item, categoryName, decodedSlug));
        seenIds.add(item.id);
      }
    });
  }

  const dynamicSubcategories = Array.from(
    new Set(articles.map((a) => a.subcategory).filter(Boolean))
  );

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

export function getAllArticles() {
  const articles = [];
  const seenIds = new Set();

  const addArticle = (item, defaultCategory = "জাতীয়", defaultSlug = "national") => {
    if (!item || !item.id) return;
    const strId = String(item.id);
    if (!seenIds.has(strId)) {
      seenIds.add(strId);
      articles.push(normalizeArticle(item, defaultCategory, defaultSlug));
    }
  };

  if (leadStory) addArticle(leadStory, leadStory.category || "জাতীয়", leadStory.categorySlug || "national");
  if (Array.isArray(secondaryLeads)) {
    secondaryLeads.forEach((item) => addArticle(item, item.category, item.categorySlug));
  }

  if (Array.isArray(latestMixedNews)) {
    latestMixedNews.forEach((item) => addArticle(item, item.category, item.categorySlug));
  }

  if (Array.isArray(handpickedNewsList)) {
    handpickedNewsList.forEach((item) => addArticle(item, item.category, item.categorySlug));
  }

  if (Array.isArray(temporaryNewsList)) {
    temporaryNewsList.forEach((item) => addArticle(item, item.category, item.categorySlug));
  }

  if (categoryNewsData) {
    Object.entries(categoryNewsData).forEach(([slug, list]) => {
      if (Array.isArray(list)) {
        list.forEach((item) => addArticle(item, item.category, slug));
      }
    });
  }

  if (Array.isArray(trendingNews)) {
    trendingNews.forEach((item) => addArticle(item, item.category, item.categorySlug));
  }

  return articles;
}

export function getArticleById(id) {
  if (!id) return null;
  const strId = String(id).toLowerCase();
  const all = getAllArticles();
  return all.find((item) => String(item.id).toLowerCase() === strId) || null;
}

export function getRelatedArticles(categorySlug, currentArticleId, limit = 4) {
  const all = getAllArticles();
  const filtered = all.filter(
    (item) =>
      item.categorySlug === categorySlug &&
      String(item.id) !== String(currentArticleId)
  );

  if (filtered.length >= limit) {
    return filtered.slice(0, limit);
  }

  const otherArticles = all.filter(
    (item) =>
      String(item.id) !== String(currentArticleId) &&
      !filtered.some((f) => String(f.id) === String(item.id))
  );

  return [...filtered, ...otherArticles].slice(0, limit);
}

export function getArticleContent(article) {
  if (!article) return [];

  if (article.hasDetailedText === false || article.noDetailedText === true) {
    return [];
  }
  if (Array.isArray(article.content)) {
    return article.content;
  }
  if (typeof article.content === "string") {
    return article.content.trim() ? article.content.split("\n\n").filter(Boolean) : [];
  }

  const { headline, summary, category, subcategory, location } = article;
  const loc = location || "ঢাকা";
  const sub = subcategory ? `${subcategory} বিষয়ক ` : "";

  return [
    `${loc} থেকে প্রাপ্ত তথ্যানুযায়ী, ${summary} এ ঘটনায় সংশ্লিষ্ট মহলে ব্যাপক আগ্রহ ও চাঞ্চল্যের সৃষ্টি হয়েছে। সংশ্লিষ্ট দায়িত্বশীল কর্তৃপক্ষ বিষয়টির সার্বিক অগ্রগতি নিবিড়ভাবে পর্যবেক্ষণ করছেন।`,
    `সংশ্লিষ্ট বিভাগের ঊর্ধ্বতন কর্মকর্তারা জানিয়েছেন, ${sub}এই উদ্যোগ ও উন্নয়ন কার্যক্রম দেশের সামগ্রিক উন্নয়ন ও জনস্বার্থে গুরুত্বপূর্ণ ভূমিকা রাখবে। প্রয়োজনীয় নীতিগত সহায়তা এবং প্রাতিষ্ঠানিক তদারকি নিশ্চিত করার মাধ্যমে এর সুফল সাধারণ মানুষের দোরগোড়ায় পৌঁছে দিতে সরকার ও সংশ্লিষ্ট অংশীজনরা একযোগে কাজ করছেন।`,
    `বিশেষজ্ঞদের মতে, সাম্প্রতিক এই ইতিবাচক পরিবর্তনের ফলে সংশ্লিষ্ট খাতে দীর্ঘমেয়াদী স্থায়িত্ব ও স্বচ্ছতা বজায় থাকবে। সাধারণ নাগরিক এবং বিশ্লেষকরা এ ধরণের গঠনমূলক পদক্ষেপকে সাধুবাদ জানিয়েছেন এবং এর ধারাবাহিক বাস্তবায়নের ওপর জোর দেওয়ার পরামর্শ দিয়েছেন।`,
    `এদিকে মাঠপর্যায়ে গৃহীত বিভিন্ন পরিকল্পনা অনুযায়ী পরবর্তী পদক্ষেপসমূহ দ্রুততম সময়ে বাস্তবায়িত হবে বলে জানা গেছে। উদ্ভূত যে কোনো পরিস্থিতি মোকাবিলায় সংশ্লিষ্ট দপ্তরগুলো সার্বক্ষণিক প্রস্তুত রয়েছে।`,
  ];
}

