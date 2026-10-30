import React from "react";
import NewsCard from "./NewsCard";

export default function MostReadSection({
  newsList = [],
  className = "",
  listClassName = "h-[360px] sm:h-[400px] overflow-y-auto pr-2 divide-y divide-slate-100 custom-scrollbar overscroll-contain",
  title = "সর্বাধিক পঠিত",
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2.5 border-b-2 border-slate-900 pb-3 mb-3 shrink-0">
        <span className="w-2.5 h-6 bg-red-600 inline-block"></span>
        <h3 className="font-serif-bangla text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
      </div>

      <div className={listClassName}>
        {!newsList || newsList.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center font-serif-bangla">
            কোনো প্রকাশিত সংবাদ পাওয়া যায়নি।
          </p>
        ) : (
          newsList.map((item) => (
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
          ))
        )}
      </div>
    </div>
  );
}
