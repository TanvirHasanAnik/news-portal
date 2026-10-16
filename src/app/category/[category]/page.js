import React from "react";
import Link from "next/link";
import { Home, ChevronRight, Layers, Newspaper } from "lucide-react";
import NewsArticleCard from "../../../components/NewsArticleCard";
import SubcategoryDropdown from "../../../components/SubcategoryDropdown";
import { getCategoryNews, getAllCategorySlugs } from "../../../utils/categoryNews";
import { categories } from "../../../data/newsData";

/**
 * Prerenders all dynamic category routes at build time as recommended in
 * https://nextjs.org/docs/app/getting-started/linking-and-navigating#dynamic-segments-without-generatestaticparams
 */
export async function generateStaticParams() {
  const slugs = getAllCategorySlugs();
  return slugs.map((slug) => ({
    category: slug,
  }));
}

/**
 * Dynamic metadata generation per category
 */
export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryData = getCategoryNews(category);

  return {
    title: `${categoryData.name} সংবাদ | আমাদের সংবাদ`,
    description: `${categoryData.name} বিভাগের সর্বশেষ ও তাজা সংবাদ সবার আগে জানুন।`,
  };
}

/**
 * Category Dynamic Page Component (Server Component / SSR)
 */
export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const selectedSub = resolvedSearchParams.sub
    ? decodeURIComponent(resolvedSearchParams.sub)
    : null;

  const categoryData = getCategoryNews(category);
  const { name, articles, subcategories, slug } = categoryData;

  // Dynamically filter articles if a subcategory is selected
  const displayedArticles = selectedSub
    ? articles.filter((a) => a.subcategory === selectedSub)
    : articles;

  const totalCount = displayedArticles.length;

  // Single page limit news to 5 articles per page
  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const parsedPage = parseInt(resolvedSearchParams.page, 10);
  const currentPage = Math.min(
    totalPages,
    Math.max(1, isNaN(parsedPage) ? 1 : parsedPage)
  );
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedArticles = displayedArticles.slice(startIndex, startIndex + PAGE_SIZE);

  const leadStory = paginatedArticles.length > 0 ? paginatedArticles[0] : null;
  const remainingArticles = paginatedArticles.length > 1 ? paginatedArticles.slice(1) : [];

  // Helper for pagination URLs preserving subcategory filter
  const getPageLink = (pageNumber) => {
    const queryParts = [];
    if (selectedSub) queryParts.push(`sub=${encodeURIComponent(selectedSub)}`);
    if (pageNumber > 1) queryParts.push(`page=${pageNumber}`);
    return queryParts.length > 0
      ? `/category/${slug}?${queryParts.join("&")}`
      : `/category/${slug}`;
  };

  // Bangla number converter helper
  const toBanglaNumber = (num) => {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(num).replace(/\d/g, (d) => banglaDigits[parseInt(d, 10)]);
  };

  // Accent color themes for different categories
  const categoryAccentMap = {
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
  };

  const accentClass =
    categoryAccentMap[slug] ||
    "from-slate-700 to-slate-900 bg-slate-800 border-slate-800 text-slate-800";
  const [gradientClasses, badgeBg, borderColor, textColor] = accentClass.split(" ");

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* 2. Category Header Banner */}
        <header className="border-b-2 border-slate-200 pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <span className={`w-3.5 sm:w-4 h-8 sm:h-10 rounded-xs ${badgeBg}`} />
              <h1 className="font-serif-bangla text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight shrink-0">
                {name}
              </h1>

              {/* Subcategory indicator if selected */}
              {selectedSub && (
                <span className="font-serif-bangla text-xl sm:text-2xl font-bold text-red-600 shrink-0">
                  / {selectedSub}
                </span>
              )}
            </div>

            {/* Mobile View: Subcategory Dropdown option on the most right side */}
            {subcategories.length > 0 && (
              <div className="sm:hidden shrink-0 flex items-center">
                <SubcategoryDropdown
                  slug={slug}
                  subcategories={subcategories}
                  selectedSub={selectedSub}
                />
              </div>
            )}
          </div>

          {/* Desktop Subcategories Selection (Dynamic from News, Bigger, Borderless Design) */}
          {subcategories.length > 0 && (
            <div className="hidden sm:flex mt-6 pt-2 items-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                {/* All / সব option */}
                <Link
                  href={`/category/${slug}`}
                  className={`px-4.5 sm:px-5 py-2 sm:py-2.5 rounded-none font-serif-bangla text-base sm:text-lg font-bold transition-all cursor-pointer whitespace-nowrap select-none bg-slate-100 hover:bg-slate-200 ${
                    !selectedSub
                      ? "text-red-600"
                      : "text-slate-800 hover:text-red-600"
                  }`}
                >
                  সকল
                </Link>

                {/* Dynamically extracted subcategories from news data */}
                {subcategories.map((sub, index) => {
                  const isSelected = selectedSub === sub;
                  return (
                    <Link
                      key={index}
                      href={`/category/${slug}?sub=${encodeURIComponent(sub)}`}
                      className={`px-4.5 sm:px-5 py-2 sm:py-2.5 rounded-none font-serif-bangla text-base sm:text-lg font-bold transition-all cursor-pointer whitespace-nowrap select-none bg-slate-100 hover:bg-slate-200 ${
                        isSelected
                          ? "text-red-600"
                          : "text-slate-800 hover:text-red-600"
                      }`}
                    >
                      {sub}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </header>

        {/* 3. Main Content Area: 2/3 News Showcase + 1/3 Ad Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 2/3 (8 cols on lg): News List (Limit 5 articles per page with Pagination) */}
          <div className="lg:col-span-8 space-y-8">
            {displayedArticles.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-none border border-slate-200 p-12 text-center space-y-4 max-w-2xl mx-auto shadow-2xs my-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Newspaper className="w-8 h-8" />
                </div>
                <h2 className="font-serif-bangla text-2xl font-bold text-slate-800">
                  এই বিভাগে বর্তমানে কোনো সংবাদ পাওয়া যায়নি
                </h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  আমাদের সংবাদকর্মীরা নিয়মিত নতুন সংবাদ যুক্ত করছেন। আপনি অন্যান্য বিভাগের তাজা সংবাদসমূহ দেখতে পারেন।
                </p>
                <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
                  <Link
                    href="/"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-xs rounded-none"
                  >
                    প্রচ্ছদে ফিরে যান
                  </Link>
                  <Link
                    href="/category/latest"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors rounded-none"
                  >
                    সর্বশেষ সংবাদ দেখুন
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 3.1 Featured / Lead Story (First of the 5 articles - Only Image, Heading, Summary) */}
                {leadStory && (
                  <section aria-label="শীর্ষ সংবাদ">
                    <article className="group bg-transparent pb-6 border-b border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Featured Image (7 cols) - No borders, no border radius, no overlays */}
                        <div className="md:col-span-7 relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                          <a href={`#news-${leadStory.id}`} className="block h-full w-full">
                            <img
                              src={leadStory.image}
                              alt={leadStory.headline}
                              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                          </a>
                        </div>

                        {/* Content Area (5 cols) - Heading & Summary only */}
                        <div className="md:col-span-5 flex flex-col justify-start">
                          <h2 className="font-serif-bangla text-2xl sm:text-3xl font-extrabold text-slate-950 leading-snug group-hover:text-red-700 transition-colors mb-3">
                            <a href={`#news-${leadStory.id}`}>
                              {leadStory.headline}
                            </a>
                          </h2>

                          {leadStory.summary && (
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-4 font-normal">
                              {leadStory.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  </section>
                )}

                {/* 3.2 Remaining News (Remaining 4 articles on this page - Only Image, Heading, Summary) */}
                {remainingArticles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                    {remainingArticles.map((story) => (
                      <NewsArticleCard
                        key={story.id}
                        news={story}
                        variant="standard"
                        showCategory={false}
                        showSubcategory={false}
                        showTime={false}
                        className="h-full bg-transparent border-0 rounded-none shadow-none"
                        imageClassName="rounded-none border-0"
                      />
                    ))}
                  </div>
                )}

                {/* 3.3 Pagination Controls */}
                {totalPages > 1 && (
                  <nav
                    aria-label="পৃষ্ঠা নেভিগেশন"
                    className="pt-6 border-t border-slate-200 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap"
                  >
                    {/* Previous Button */}
                    {currentPage > 1 ? (
                      <Link
                        href={getPageLink(currentPage - 1)}
                        className="px-3.5 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-serif-bangla font-semibold transition-colors cursor-pointer select-none rounded-none"
                      >
                        &larr; পূর্ববর্তী
                      </Link>
                    ) : (
                      <span className="px-3.5 sm:px-4 py-2 bg-slate-50 text-slate-300 text-sm font-serif-bangla font-semibold select-none rounded-none cursor-not-allowed">
                        &larr; পূর্ববর্তী
                      </span>
                    )}

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const isActive = p === currentPage;
                      return (
                        <Link
                          key={p}
                          href={getPageLink(p)}
                          className={`min-w-[38px] sm:min-w-[42px] h-9 sm:h-10 px-2 flex items-center justify-center text-sm sm:text-base font-serif-bangla font-bold transition-colors cursor-pointer select-none rounded-none ${
                            isActive
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-red-600"
                          }`}
                        >
                          {toBanglaNumber(p)}
                        </Link>
                      );
                    })}

                    {/* Next Button */}
                    {currentPage < totalPages ? (
                      <Link
                        href={getPageLink(currentPage + 1)}
                        className="px-3.5 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-serif-bangla font-semibold transition-colors cursor-pointer select-none rounded-none"
                      >
                        পরবর্তী &rarr;
                      </Link>
                    ) : (
                      <span className="px-3.5 sm:px-4 py-2 bg-slate-50 text-slate-300 text-sm font-serif-bangla font-semibold select-none rounded-none cursor-not-allowed">
                        পরবর্তী &rarr;
                      </span>
                    )}
                  </nav>
                )}
              </div>
            )}
          </div>

          {/* Right 1/3 (4 cols on lg): Ad Space */}
          <aside
            aria-label="বিজ্ঞাপন এলাকা"
            className="lg:col-span-4 space-y-6 lg:sticky lg:top-20"
          >
            {/* Medium Rectangle Ad (300 × 250) */}
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 w-full max-w-[320px] aspect-[300/250] mx-auto flex flex-col items-center justify-center text-center p-4 relative group">
              <span className="absolute top-2 left-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                বিজ্ঞাপন
              </span>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                বিজ্ঞাপনের জন্য স্থান
              </p>
              <p className="text-slate-400 text-[11px] mt-1 font-mono">
                ৩০০ × ২৫০ পিক্সেল
              </p>
            </div>

            {/* Half-Page Skyscraper Ad (300 × 600) */}
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 w-full max-w-[320px] aspect-[300/600] mx-auto hidden sm:flex flex-col items-center justify-center text-center p-4 relative group">
              <span className="absolute top-2 left-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                বিজ্ঞাপন
              </span>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                বিজ্ঞাপনের জন্য স্থান
              </p>
              <p className="text-slate-400 text-[11px] mt-1 font-mono">
                ৩০০ × ৬০০ পিক্সেল
              </p>
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}

