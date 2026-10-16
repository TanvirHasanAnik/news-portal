import React from "react";
import Link from "next/link";
import { Home, ChevronRight, Layers, Newspaper, Flame, Clock } from "lucide-react";
import NewsArticleCard from "../../../components/NewsArticleCard";
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
export default async function CategoryPage({ params }) {
  const { category } = await params;
  const categoryData = getCategoryNews(category);
  const { name, articles, subcategories, slug, totalCount } = categoryData;

  const leadStory = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1) : [];

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
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Breadcrumbs Navigation */}
        <nav aria-label="ব্রেডক্রাম্ব" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-red-600 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>প্রচ্ছদ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 font-serif-bangla text-sm sm:text-base">
            {name}
          </span>
        </nav>

        {/* 2. Category Header Banner */}
        <header className="border-b-2 border-slate-200 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`w-3.5 sm:w-4 h-8 sm:h-10 rounded-xs ${badgeBg}`} />
                <h1 className="font-serif-bangla text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
                  {name}
                </h1>
              </div>
            </div>
          </div>

          {/* Subcategories Filter Pills */}
          {subcategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-5 pt-4 border-t border-slate-200/70">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                উপ-বিভাগ:
              </span>
              {subcategories.map((sub, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  {sub}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 3. News Articles Showcase */}
        {articles.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-2xl mx-auto shadow-2xs my-12">
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
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-xs"
              >
                প্রচ্ছদে ফিরে যান
              </Link>
              <Link
                href="/category/latest"
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                সর্বশেষ সংবাদ দেখুন
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 3.1 Featured / Lead Story */}
            {leadStory && (
              <section aria-label="শীর্ষ সংবাদ">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                    {/* Image Area (7 cols on desktop) */}
                    <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[260px] sm:min-h-[360px] bg-slate-900 overflow-hidden group">
                      <img
                        src={leadStory.image}
                        alt={leadStory.headline}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-md flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5" />
                          প্রধান খবর
                        </span>
                      </div>
                    </div>

                    {/* Content Area (5 cols on desktop) */}
                    <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {leadStory.location && (
                            <span className="font-semibold text-slate-700">
                              {leadStory.location}
                            </span>
                          )}
                          {leadStory.location && <span>•</span>}
                          {leadStory.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {leadStory.publishedAt}
                            </span>
                          )}
                        </div>

                        <h2 className="font-serif-bangla text-2xl sm:text-3xl font-extrabold text-slate-950 leading-snug hover:text-red-600 transition-colors">
                          <a href={`#news-${leadStory.id}`}>
                            {leadStory.headline}
                          </a>
                        </h2>

                        {leadStory.summary && (
                          <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-4">
                            {leadStory.summary}
                          </p>
                        )}
                      </div>

                      <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                          প্রতিবেদক: {leadStory.author || "নিজস্ব প্রতিবেদক"}
                        </span>
                        <a
                          href={`#news-${leadStory.id}`}
                          className="font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group"
                        >
                          সম্পূর্ণ পড়ুন
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 3.2 Remaining Category Articles Grid */}
            {remainingArticles.length > 0 && (
              <section aria-label="বিভাগের অন্যান্য সংবাদ" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-serif-bangla text-xl sm:text-2xl font-bold text-slate-900">
                    আরও সংবাদ
                  </h3>
                  <span className="text-xs text-slate-500">
                    {remainingArticles.length} টি সংবাদ
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {remainingArticles.map((story) => (
                    <NewsArticleCard
                      key={story.id}
                      news={story}
                      variant="standard"
                      showCategory={false}
                      showTime={true}
                      className="h-full bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* 4. Other Categories Navigation Strip */}
        <section aria-label="অন্যান্য বিভাগ" className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-bangla text-lg sm:text-xl font-bold text-slate-900">
              অন্যান্য বিভাগসমূহ ঘুরে দেখুন
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories
              .filter((c) => c.slug !== slug)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="p-3 bg-white hover:bg-red-50 hover:border-red-300 border border-slate-200 rounded-xl text-center transition-all group shadow-2xs"
                >
                  <span className="font-serif-bangla text-base font-bold text-slate-800 group-hover:text-red-600 transition-colors block">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-red-500 transition-colors">
                    সংবাদ দেখুন &rarr;
                  </span>
                </Link>
              ))}
          </div>
        </section>

      </div>
    </div>
  );
}

