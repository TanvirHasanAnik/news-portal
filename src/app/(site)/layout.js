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

      <Header breakingNewsList={breakingNewsList} categories={dbCategories} />


      <div className="flex-1">
        {children}
      </div>


      <Footer categories={dbCategories} />
    </>
  );
}

