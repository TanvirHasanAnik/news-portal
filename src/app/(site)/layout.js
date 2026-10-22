import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getActiveBreakingNews } from "@/repositories/curationRepository";

export default async function SiteLayout({ children }) {
  let breakingNewsList = [];
  try {
    breakingNewsList = await getActiveBreakingNews(10);
  } catch (err) {
    console.error("Error loading breaking news for layout:", err);
  }

  return (
    <>
      {/* 1. Header with Top Ad Banner, Logo, Navigation & Tickers */}
      <Header breakingNewsList={breakingNewsList} />

      {/* 2. Main Page Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* 3. Global Newspaper Footer */}
      <Footer />
    </>
  );
}

