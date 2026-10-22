import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getActiveBreakingNews } from "@/repositories/curationRepository";
import { getAllCategoriesWithSubcategories } from "@/repositories/categoryRepository";

export default async function SiteLayout({ children }) {
  let breakingNewsList = [];
  let dbCategories = [];
  try {
    const [breaking, cats] = await Promise.all([
      getActiveBreakingNews(10),
      getAllCategoriesWithSubcategories(),
    ]);
    breakingNewsList = breaking || [];
    dbCategories = cats || [];
  } catch (err) {
    console.error("Error loading layout data:", err);
  }

  return (
    <>
      {/* 1. Header with Top Ad Banner, Logo, Navigation & Tickers */}
      <Header breakingNewsList={breakingNewsList} categories={dbCategories} />

      {/* 2. Main Page Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* 3. Global Newspaper Footer */}
      <Footer categories={dbCategories} />
    </>
  );
}

