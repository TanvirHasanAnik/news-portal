import React from "react";
import Link from "next/link";
import { Home, ChevronRight, Layers, Newspaper } from "lucide-react";
import NewsArticleCard from "@/components/NewsArticleCard";
import SubcategoryDropdown from "@/components/SubcategoryDropdown";
import AdHolder from "@/components/AdHolder";
import { getCategoryNews, getAllCategorySlugs, categoryAccentMap } from "@/utils/categoryNews";
import { categories } from "@/data/newsData";
import { getPublishedArticles, mapDbArticleToFrontend } from "@/repositories/articleRepository";
import { getActiveHandpickedArticles } from "@/repositories/curationRepository";
import {
  getCategoryBySlug,
  getSubcategoriesByCategoryId,
  getAllCategories,
} from "@/repositories/categoryRepository";

export const dynamic = "force-dynamic";



export async function generateStaticParams() {
  const staticSlugs = getAllCategorySlugs();
  const allSlugs = new Set(staticSlugs);
  try {
    const dbCats = await getAllCategories();
    (dbCats || []).forEach((c) => {
      if (c.slug) allSlugs.add(c.slug);
    });
  } catch (_e) {}

  return Array.from(allSlugs).map((slug) => ({
    category: slug,
  }));
}



export async function generateMetadata({ params }) {
  const { category } = await params;
  let categoryName = "";
  try {
    const dbCat = await getCategoryBySlug(category);
    if (dbCat?.name) categoryName = dbCat.name;
  } catch (_e) {}

  if (!categoryName) {
    const categoryData = getCategoryNews(category);
    categoryName = categoryData.name;
  }

  const pageTitle = categoryName.endsWith("সংবাদ")
    ? `${categoryName} | আলো আসবে`
    : `${categoryName} সংবাদ | আলো আসবে`;

  return {
    title: pageTitle,
    description: `${categoryName} বিভাগের সর্বশেষ ও তাজা সংবাদ সবার আগে জানুন।`,
  };
}



export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const selectedSub = resolvedSearchParams.sub
    ? decodeURIComponent(resolvedSearchParams.sub)
    : null;

  const categoryData = getCategoryNews(category);
  let { name, articles, subcategories, slug } = categoryData;


  let dbSubcategories = [];
  try {
    const dbCat = await getCategoryBySlug(category);
    if (dbCat) {
      if (dbCat.name) name = dbCat.name;
      const subs = await getSubcategoriesByCategoryId(dbCat.id);
      dbSubcategories = (subs || []).map((s) => s.name).filter(Boolean);
    }
  } catch (err) {
    console.error("Error fetching db category details:", err);
  }


  let dbArticles = [];
  try {
    if (category === "handpicked") {
      dbArticles = await getActiveHandpickedArticles(50);
    } else {
      const raw = await getPublishedArticles({ categorySlug: category, limit: 50 });
      dbArticles = (raw || []).map(mapDbArticleToFrontend);
    }
  } catch (err) {
    console.error("Error fetching db articles for category page:", err);
  }


  const baseArticles = [...dbArticles, ...articles];
  const seenKeys = new Set();
  const mergedArticles = [];
  for (const item of baseArticles) {
    if (!item) continue;
    const key = item.id || item.slug;
    if (key && !seenKeys.has(key)) {
      seenKeys.add(key);
      mergedArticles.push(item);
    }
  }


  const displayedArticles = selectedSub
    ? mergedArticles.filter(
        (a) => a.subcategory === selectedSub || a.originalCategory === selectedSub
      )
    : mergedArticles;


  const liveSubcategories = dbArticles.map((a) => a.subcategory).filter(Boolean);
  const combinedSubcategories = Array.from(
    new Set([...subcategories, ...dbSubcategories, ...liveSubcategories])
  );

  const totalCount = displayedArticles.length;


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


  const getPageLink = (pageNumber) => {
    const queryParts = [];
    if (selectedSub) queryParts.push(`sub=${encodeURIComponent(selectedSub)}`);
    if (pageNumber > 1) queryParts.push(`page=${pageNumber}`);
    return queryParts.length > 0
      ? `/category/${slug}?${queryParts.join("&")}`
      : `/category/${slug}`;
  };


  const toBanglaNumber = (num) => {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(num).replace(/\d/g, (d) => banglaDigits[parseInt(d, 10)]);
  };

  const accentClass =
    categoryAccentMap[slug] ||
    "from-slate-700 to-slate-900 bg-slate-800 border-slate-800 text-slate-800";
  const [gradientClasses, badgeBg, borderColor, textColor] = accentClass.split(" ");

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">


        <header className="border-b-2 border-slate-200 pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <span className={`w-3.5 sm:w-4 h-8 sm:h-10 rounded-xs ${badgeBg}`} />
              <h1 className="font-serif-bangla text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight shrink-0">
                {name}
              </h1>


              {selectedSub && (
                <span className="font-serif-bangla text-xl sm:text-2xl font-bold text-red-600 shrink-0">
                  / {selectedSub}
                </span>
              )}
            </div>


            {combinedSubcategories.length > 0 && (
              <div className="sm:hidden shrink-0 flex items-center">
                <SubcategoryDropdown
                  slug={slug}
                  subcategories={combinedSubcategories}
                  selectedSub={selectedSub}
                />
              </div>
            )}
          </div>


          {combinedSubcategories.length > 0 && (
            <div className="hidden sm:flex mt-6 pt-2 items-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">

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


                {combinedSubcategories.map((sub, index) => {
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


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">


          <div className="lg:col-span-8 space-y-8">
            {displayedArticles.length === 0 ? (

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

                {leadStory && (
                  <section aria-label="শীর্ষ সংবাদ">
                    <NewsArticleCard
                      news={leadStory}
                      variant="hero"
                      headlineTag="h2"
                      headlineSize="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-3"
                      headlineHoverColor="group-hover:text-red-700"
                      summaryClamp="line-clamp-4"
                      summarySize="text-sm sm:text-base"
                      imageAspect="aspect-[16/10]"
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pb-6 border-b border-slate-200"
                    />
                  </section>
                )}


                {leadStory && (
                  <div className="lg:hidden pb-6 border-b border-slate-200">
                    <AdHolder size="300x250" />
                  </div>
                )}


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


                <nav
                  aria-label="পৃষ্ঠা নেভিগেশন"
                  className="pt-6 border-t border-slate-200 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap"
                >

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
              </div>
            )}
          </div>


          <aside
            aria-label="বিজ্ঞাপন এলাকা"
            className="hidden lg:block lg:col-span-4 space-y-6"
          >

            <AdHolder size="300x250" />


            <AdHolder size="300x600" className="hidden sm:flex" />
          </aside>

        </div>

      </div>
    </div>
  );
}

