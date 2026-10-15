import Header from "../components/Header";
import NewsTickerSection from "../components/NewsTickerSection";
import LatestMixedSection from "../components/LatestMixedSection";
import CategoryScrollSection from "../components/CategoryScrollSection";
import OpinionSection from "../components/OpinionSection";
import MediaGallery from "../components/MediaGallery";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* 1. Header with Brand Logo, Category & Subcategory Navbar */}
      <Header />

      {/* 2. Breaking News & Headline Sliding Tickers */}
      <NewsTickerSection />

      {/* Main Content Flow */}
      <main className="flex-1">
        {/* 3. Featured / Lead News Section (শীর্ষ সংবাদ) */}

        {/* 4. Requirement 2: Latest Mixed Category Published Section */}
        {/* Latest 3 news emphasizing the most recent one with See More */}
        <LatestMixedSection />

        {/* 5. Requirement 3: Scroll For each main category */}
        {/* Latest 3 news emphasizing the most recent one with See More */}
        <CategoryScrollSection />

        {/* 6. Editorial Opinion & Columns (সম্পাদকীয় ও মতামত) */}
        <OpinionSection />

        {/* 7. Multimedia Gallery (ভিডিও ও ছবির গল্প) */}
        <MediaGallery />
      </main>

      {/* 8. Professional Newspaper Footer */}
      <Footer />
    </div>
  );
}
