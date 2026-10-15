"use client";

import React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import NewsArticleCard from "./NewsArticleCard";
import { categories, categoryNewsData } from "../data/newsData";

/**
 * Requirement 3:
 * For every category section:
 * - 2 same width columns
 * - 1 news: takes 1st column only
 * - 2 news: takes both 1st latest and 2nd latest column
 * - 3 news: adds another row on the bottom and takes bottom left cell for 3rd latest news
 * - 4 news: fills the 4th with the 2nd column of the bottom row
 * Bangla font and responsive for both desktop and phone.
 */
export default function CategoryScrollSection() {
  // All main categories with news data
  const displayCategories = categories.filter((c) => categoryNewsData[c.slug]);

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Feed: 2 equal-width columns grid per category */}
        <div className="space-y-12">
          {displayCategories.map((cat, catIdx) => {
            const articles = categoryNewsData[cat.slug] || [];
            if (articles.length === 0) return null;

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

                {/* 2 Equal-Width Columns Grid
                    - 1 news: takes 1st column only (row 1, col 1)
                    - 2 news: takes 1st latest (row 1, col 1) and 2nd latest (row 1, col 2)
                    - 3 news: adds another row on the bottom and takes bottom left cell (row 2, col 1) for 3rd latest
                    - 4 news: fills the 4th with the 2nd column of the bottom row (row 2, col 2)
                */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {articles.slice(0, 4).map((story) => (
                    <NewsArticleCard
                      key={story.id}
                      news={story}
                      variant="standard"
                      showCategory={false}
                      showTime={false}
                      className="h-full"
                    />
                  ))}
                </div>

                {/* Bottom Category See More Banner / Link */}
                <div className="pt-4 text-right">
                  <a
                    href={`#category-${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-700 hover:text-red-800 hover:underline"
                  >
                    <span>{cat.name} বিভাগের সব খবর পড়ুন</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

