import LatestMixedSection from "@/components/LatestMixedSection";
import HandpickedNewsSection from "@/components/HandpickedNewsSection";
import CategoryScrollSection from "@/components/CategoryScrollSection";
import { unstable_cache } from "next/cache";
import { TAGS } from "@/lib/cache/tags";
import {
  getPublishedArticles,
  mapDbArticleToFrontend,
} from "@/repositories/articleRepository";
import { getTopArticles } from "@/repositories/analyticsRepository";
import { getActiveHandpickedArticles } from "@/repositories/curationRepository";
import { getDynamicCategoriesWithSubcategories } from "@/repositories/categoryRepository";

export const revalidate = false;

const getCachedHomepageData = unstable_cache(
  async () => {
    const [raw, mostRead, handpicked, dynamicCats] = await Promise.all([
      getPublishedArticles({ limit: 20 }),
      getTopArticles(10),
      getActiveHandpickedArticles(4),
      getDynamicCategoriesWithSubcategories(),
    ]);

    let categorySections = [];
    if (Array.isArray(dynamicCats) && dynamicCats.length > 0) {
      const catResults = await Promise.all(
        dynamicCats.map(async (cat) => {
          try {
            const catArticles = await getPublishedArticles({ categorySlug: cat.slug, limit: 4 });
            return {
              ...cat,
              articles: (catArticles || []).map(mapDbArticleToFrontend),
            };
          } catch {
            return { ...cat, articles: [] };
          }
        })
      );
      categorySections = catResults.filter((c) => c.articles && c.articles.length > 0);
    }

    return {
      dbArticles: (raw || []).map(mapDbArticleToFrontend),
      mostReadArticles: mostRead || [],
      handpickedArticles: handpicked || [],
      categorySections,
    };
  },
  ["homepage-data"],
  {
    tags: [
      TAGS.HOMEPAGE,
      TAGS.ARTICLES_PUBLISHED,
      TAGS.CURATION_HANDPICKED,
      TAGS.CATEGORIES,
    ],
  }
);

export default async function Home() {
  let dbArticles = [];
  let mostReadArticles = [];
  let handpickedArticles = [];
  let categorySections = [];

  try {
    const data = await getCachedHomepageData();
    dbArticles = data.dbArticles || [];
    mostReadArticles = data.mostReadArticles || [];
    handpickedArticles = data.handpickedArticles || [];
    categorySections = data.categorySections || [];
  } catch (err) {
    console.error("Error loading db articles for homepage:", err);
  }

  return (
    <>
      <LatestMixedSection dbArticles={dbArticles} />

      <HandpickedNewsSection
        newsList={handpickedArticles}
        dbArticles={dbArticles}
        mostReadList={mostReadArticles}
      />

      <CategoryScrollSection categorySections={categorySections} />
    </>
  );
}
