import React from "react";
import Link from "next/link";
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
 * Rendered as a React Server Component (SSR).
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
                    <Link
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-2 group hover:text-red-600 transition-colors"
                      title={`${cat.name} বিভাগের সব সংবাদ`}
                    >
                      <span className={`w-3.5 h-7 rounded-xs ${bgColor}`}></span>
                      <h3 className="font-serif-bangla text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-red-600 tracking-tight transition-colors">
                        {cat.name}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>

                  {/* See more link */}
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1 group transition-colors self-start sm:self-auto"
                  >
                    সব {cat.name} সংবাদ
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

