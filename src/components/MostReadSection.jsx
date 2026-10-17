import React from "react";
import NewsCard from "./NewsCard";
import { trendingNews } from "../data/newsData";
import { getOptimizedNewsImage } from "../utils/imageUtils";

/**
 * Pre-optimized most read news list at module scope
 */
const staticMostReadNews = trendingNews.map((item) => ({
  ...item,
  image: getOptimizedNewsImage(item.image, 240, 70),
}));

/**
 * Reusable MostReadSection (সর্বাধিক পঠিত) Component
 * 
 * Reused between Homepage HandpickedNewsSection and Single Article Reading Page.
 */
export default function MostReadSection({
  newsList = staticMostReadNews,
  className = "",
  listClassName = "h-[360px] sm:h-[400px] overflow-y-auto pr-2 divide-y divide-slate-100 custom-scrollbar overscroll-contain",
  title = "সর্বাধিক পঠিত",
}) {
  if (!newsList || newsList.length === 0) return null;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Section Header */}
      <div className="flex items-center gap-2.5 border-b-2 border-slate-900 pb-3 mb-3 shrink-0">
        <span className="w-2.5 h-6 bg-red-600 inline-block"></span>
        <h3 className="font-serif-bangla text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
      </div>

      {/* Scrollable News List */}
      <div className={listClassName}>
        {newsList.map((item) => (
          <NewsCard
            key={`${item.categorySlug || item.category}-${item.id}`}
            news={item}
            variant="horizontal"
            imageWrapperClassName="w-24 h-16 sm:w-28 sm:h-18"
            headlineTag="h4"
            headlineSize="text-sm sm:text-[15px]"
            showCategory={true}
            categoryPlacement="bottom"
            showSummary={false}
            className="items-center py-3 first:pt-0 last:pb-0"
          />
        ))}
      </div>
    </div>
  );
}

