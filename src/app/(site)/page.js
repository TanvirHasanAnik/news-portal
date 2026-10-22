import LatestMixedSection from "@/components/LatestMixedSection";
import HandpickedNewsSection from "@/components/HandpickedNewsSection";
import CategoryScrollSection from "@/components/CategoryScrollSection";
import {
  getPublishedArticles,
  getMostReadArticles,
  mapDbArticleToFrontend,
} from "@/repositories/articleRepository";
import { getActiveHandpickedArticles } from "@/repositories/curationRepository";
import { getDynamicCategoriesWithSubcategories } from "@/repositories/categoryRepository";

export const dynamic = "force-dynamic";

export default async function Home() {
  let dbArticles = [];
  let mostReadArticles = [];
  let handpickedArticles = [];
  let dynamicCats = [];
  try {
    const [raw, mostRead, handpicked, cats] = await Promise.all([
      getPublishedArticles({ limit: 20 }),
      getMostReadArticles(10),
      getActiveHandpickedArticles(4),
      getDynamicCategoriesWithSubcategories(),
    ]);
    dbArticles = (raw || []).map(mapDbArticleToFrontend);
    mostReadArticles = mostRead || [];
    handpickedArticles = handpicked || [];
    dynamicCats = cats || [];
  } catch (err) {
    console.error("Error loading db articles for homepage:", err);
  }

  return (
    <>
      {/* 1. Requirement 2: Latest Mixed Category Published Section */}
      <LatestMixedSection dbArticles={dbArticles} />

      {/* 2. Handpicked News Section (বাছাইকৃত সংবাদ) - Column ratio 2:1 */}
      <HandpickedNewsSection
        newsList={handpickedArticles}
        dbArticles={dbArticles}
        mostReadList={mostReadArticles}
      />

      {/* 3. Requirement 3: Categorized news showcase sections */}
      <CategoryScrollSection dbArticles={dbArticles} categories={dynamicCats} />
    </>
  );
}
