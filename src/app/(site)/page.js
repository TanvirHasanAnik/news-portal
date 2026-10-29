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

      <LatestMixedSection dbArticles={dbArticles} />


      <HandpickedNewsSection
        newsList={handpickedArticles}
        dbArticles={dbArticles}
        mostReadList={mostReadArticles}
      />


      <CategoryScrollSection dbArticles={dbArticles} categories={dynamicCats} />
    </>
  );
}
