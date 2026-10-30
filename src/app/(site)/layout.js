import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getActiveBreakingNews } from "@/repositories/curationRepository";
import { getAllCategoriesWithSubcategories } from "@/repositories/categoryRepository";
import { getPublishedArticles, mapDbArticleToFrontend } from "@/repositories/articleRepository";

export default async function SiteLayout({ children }) {
  let breakingNewsList = [];
  let dbCategories = [];
  let latestHeadlines = [];
  try {
    const [breaking, cats, rawHeadlines] = await Promise.all([
      getActiveBreakingNews(10),
      getAllCategoriesWithSubcategories(),
      getPublishedArticles({ limit: 3 }),
    ]);
    breakingNewsList = breaking || [];
    dbCategories = cats || [];
    latestHeadlines = (rawHeadlines || []).map(mapDbArticleToFrontend);
  } catch (err) {
    console.error("Error loading layout data:", err);
  }

  return (
    <>
      <Header
        breakingNewsList={breakingNewsList}
        latestHeadlines={latestHeadlines}
        categories={dbCategories}
      />
      <div className="flex-1">
        {children}
      </div>
      <Footer categories={dbCategories} />
    </>
  );
}
