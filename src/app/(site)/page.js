import LatestMixedSection from "@/components/LatestMixedSection";
import HandpickedNewsSection from "@/components/HandpickedNewsSection";
import CategoryScrollSection from "@/components/CategoryScrollSection";
import { getPublishedArticles, mapDbArticleToFrontend } from "@/repositories/articleRepository";

export const dynamic = "force-dynamic";

export default async function Home() {
  let dbArticles = [];
  try {
    const raw = await getPublishedArticles({ limit: 20 });
    dbArticles = (raw || []).map(mapDbArticleToFrontend);
  } catch (err) {
    console.error("Error loading db articles for homepage:", err);
  }

  return (
    <>
      {/* 1. Requirement 2: Latest Mixed Category Published Section */}
      <LatestMixedSection dbArticles={dbArticles} />

      {/* 2. Handpicked News Section (বাছাইকৃত সংবাদ) - Column ratio 2:1 */}
      <HandpickedNewsSection dbArticles={dbArticles} />

      {/* 3. Requirement 3: Categorized news showcase sections */}
      <CategoryScrollSection dbArticles={dbArticles} />
    </>
  );
}
