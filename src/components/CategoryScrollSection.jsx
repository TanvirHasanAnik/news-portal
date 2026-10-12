"use client";

import React, { useState } from "react";
import { ArrowRight, ChevronRight, Layers, Sparkles, SlidersHorizontal } from "lucide-react";
import NewsArticleCard from "./NewsArticleCard";
import { categories, categoryNewsData } from "../data/newsData";

/**
 * Requirement 3:
 * Scroll For each main category: Latest 3 news emphasizing most recent one with see more.
 * Bangla font and responsive for both desktop and phone.
 */
export default function CategoryScrollSection() {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");

  // Filtered categories to display (or all main categories)
  const displayCategories = activeCategoryFilter === "all"
    ? categories.filter((c) => categoryNewsData[c.slug])
    : categories.filter((c) => c.slug === activeCategoryFilter && categoryNewsData[c.slug]);

  const scrollToCategory = (catSlug) => {
    const el = document.getElementById(`cat-${catSlug}`);
    if (el) {
      const yOffset = -70; // offset for sticky navbar
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sticky / Quick Jump Bar for Category Scroll */}
        <div className="sticky top-12 z-30 bg-white/95 backdrop-blur-md py-3 border-y border-slate-200 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-xl sm:border shadow-2xs">
          <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-red-600" />
              <span className="hidden sm:inline">বিভাগভিত্তিক স্ক্রল:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setActiveCategoryFilter("all")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all shrink-0 ${
                  activeCategoryFilter === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                সব বিভাগ স্ক্রল
              </button>

              {categories
                .filter((c) => categoryNewsData[c.slug])
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (activeCategoryFilter !== "all") {
                        setActiveCategoryFilter("all");
                      }
                      setTimeout(() => scrollToCategory(cat.slug), 50);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all shrink-0 ${
                      activeCategoryFilter === cat.slug
                        ? "bg-red-600 text-white shadow-xs font-bold"
                        : "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Categories Feed: Each main category with Latest 3 news (emphasizing #1) + See more */}
        <div className="space-y-12">
          {displayCategories.map((cat, catIdx) => {
            const articles = categoryNewsData[cat.slug] || [];
            if (articles.length === 0) return null;

            const emphasizedStory = articles[0]; // #1 Most Recent
            const companionStories = articles.slice(1, 3); // #2 and #3

            // Accent colors per category for visual identity
            const accentColors = [
              "border-red-600 text-red-600 bg-red-600",
              "border-blue-600 text-blue-600 bg-blue-600",
              "border-emerald-600 text-emerald-600 bg-emerald-600",
              "border-amber-600 text-amber-600 bg-amber-600",
              "border-purple-600 text-purple-600 bg-purple-600",
              "border-rose-600 text-rose-600 bg-rose-600",
              "border-teal-600 text-teal-600 bg-teal-600",
            ];
            const currentAccent = accentColors[catIdx % accentColors.length];
            const [borderColor, textColor, bgColor] = currentAccent.split(" ");

            return (
              <div
                key={cat.id}
                id={`cat-${cat.slug}`}
                className="scroll-mt-24 pb-8 border-b border-slate-200 last:border-b-0"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-3 mb-6">
                  {/* Category Title + Subcategories Pills */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-7 rounded-xs ${bgColor}`}></span>
                      <h3 className="font-serif-bangla text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {cat.name}
                      </h3>
                    </div>

                    {/* Subcategories quick links */}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-300 text-xs text-slate-500">
                        {cat.subcategories.slice(0, 4).map((sub, sIdx) => (
                          <a
                            key={sIdx}
                            href={`#${cat.slug}-${sub}`}
                            className="hover:text-red-600 hover:underline transition-colors"
                          >
                            {sub}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* "See More" Button in Category Header */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`#category-${cat.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all group"
                    >
                      <span>{cat.name} এর আরও সংবাদ</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Latest 3 News Grid: Emphasizing #1 most recent item */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* #1 MOST RECENT ITEM (EMPHASIZED HERO: 7 Columns) */}
                  <div className="lg:col-span-7 flex flex-col">
                    <div className="mb-2 text-xs font-semibold text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-red-600">
                        <Sparkles className="w-3.5 h-3.5" />
                        সাম্প্রতিক প্রধান খবর
                      </span>
                      <span className="text-slate-400">সর্বশেষ আপডেট</span>
                    </div>

                    <NewsArticleCard
                      news={emphasizedStory}
                      variant="emphasized"
                      showCategory={false}
                      className="h-full"
                    />
                  </div>

                  {/* #2 and #3 COMPANION ITEMS (5 Columns: 2 horizontal cards) */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        এই বিভাগের আরও খবর
                      </span>
                      <span className="text-slate-400">২টি সংবাদ</span>
                    </div>

                    <div className="flex flex-col gap-4 flex-1">
                      {companionStories.map((story) => (
                        <NewsArticleCard
                          key={story.id}
                          news={story}
                          variant="horizontal"
                          showCategory={false}
                          className="flex-1"
                        />
                      ))}
                    </div>

                    {/* Bottom Category See More Banner / Link */}
                    <div className="pt-2 text-right">
                      <a
                        href={`#category-${cat.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-700 hover:text-red-800 hover:underline"
                      >
                        <span>{cat.name} বিভাগের সব খবর পড়ুন</span>
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

