"use client";

import React from "react";
import { handpickedNewsList } from "../data/handpickedNewsData";
import { categories, categoryNewsData } from "../data/newsData";
import { temporaryNewsList } from "../data/temporaryNewsData";


/**
 * HandpickedNewsSection (বাছাইকৃত সংবাদ)
 * 
 * Column ratio: 2 : 1
 * - First column (Width 2): Handpicked news
 *   - 1 news: Takes the whole space
 *   - 2 news: Divides space and takes horizontal space (side-by-side)
 *   - 3 or 4 news: 2x2 grid with equal space for each corner
 *   - #No borders, only image, headline, and summary lines
 * - Second column (Width 1): Latest single news from each category
 *   - Takes the exact same height as the first column
 *   - Has its own scrollbar
 *   - Card: Left side image, right side headline with category name at bottom
 */
export default function HandpickedNewsSection({ newsList = handpickedNewsList }) {
  // Ensure we display up to 4 items in the handpicked section
  const displayNews = newsList.slice(0, 4);
  const count = displayNews.length;

  // Extract latest single news from each category
  const latestCategoryNews = React.useMemo(() => {
    const result = [];
    const seenCategories = new Set();

    categories.forEach((cat) => {
      if (cat.slug === "latest") return;
      const list = categoryNewsData[cat.slug];
      if (list && list.length > 0) {
        result.push({
          id: list[0].id,
          headline: list[0].headline,
          image: list[0].image,
          category: list[0].category || cat.name,
          categorySlug: cat.slug,
        });
        seenCategories.add(cat.slug);
      }
    });

    temporaryNewsList.forEach((news) => {
      if (news.categorySlug && !seenCategories.has(news.categorySlug)) {
        result.push({
          id: news.id,
          headline: news.headline,
          image: news.image,
          category: news.category,
          categorySlug: news.categorySlug,
        });
        seenCategories.add(news.categorySlug);
      }
    });

    return result;
  }, []);

  if (count === 0) return null;


  return (
    <section id="handpicked" className="py-6 sm:py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2:1 Column Ratio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* =========================================================================
              FIRST COLUMN (Ratio 2) - Handpicked News (বাছাইকৃত সংবাদ)
             ========================================================================= */}
          <div className="lg:col-span-2">
            
            {/* Section Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-red-600 inline-block"></span>
                <h2 className="font-serif-bangla text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  বাছাইকৃত সংবাদ
                </h2>
              </div>
            </div>

            {/* Handpicked News Cards Container - Layout adapts dynamically to item count */}
            {/* Rule 1: Exactly 1 handpicked news -> Takes the whole space */}
            {count === 1 && (
              <article className="group flex flex-col w-full">
                <div className="w-full aspect-[21/9] sm:aspect-[2.4/1] max-h-[280px] sm:max-h-[320px] overflow-hidden bg-slate-100">
                  <a href={`#news-${displayNews[0].id}`} className="block w-full h-full">
                    <img
                      src={displayNews[0].image}
                      alt={displayNews[0].headline}
                      loading="eager"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </a>
                </div>
                <h3 className="font-serif-bangla text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-3 sm:mt-4">
                  <a href={`#news-${displayNews[0].id}`}>
                    {displayNews[0].headline}
                  </a>
                </h3>
                {displayNews[0].summary && (
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-2 sm:mt-2.5 line-clamp-3 font-normal">
                    {displayNews[0].summary}
                  </p>
                )}
              </article>
            )}

            {/* Rule 2: Exactly 2 handpicked news -> Divide the space horizontally */}
            {count === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                {displayNews.map((news) => (
                  <article key={news.id} className="group flex flex-col">
                    <div className="w-full aspect-[16/9] max-h-[200px] sm:max-h-[230px] overflow-hidden bg-slate-100">
                      <a href={`#news-${news.id}`} className="block w-full h-full">
                        <img
                          src={news.image}
                          alt={news.headline}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </a>
                    </div>
                    <h3 className="font-serif-bangla text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mt-2.5">
                      <a href={`#news-${news.id}`}>
                        {news.headline}
                      </a>
                    </h3>
                    {news.summary && (
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-1.5 line-clamp-2 font-normal">
                        {news.summary}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}

            {/* Rule 3: 3 or 4 handpicked news -> 2x2 grid with compact image space */}
            {count >= 3 && (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                {displayNews.map((news) => (
                  <article key={news.id} className="group flex flex-col">
                    <div className="w-full aspect-[16/10] sm:aspect-[16/9] max-h-[160px] sm:max-h-[180px] md:max-h-[200px] overflow-hidden bg-slate-100">
                      <a href={`#news-${news.id}`} className="block w-full h-full">
                        <img
                          src={news.image}
                          alt={news.headline}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </a>
                    </div>
                    <h3 className="font-serif-bangla text-sm sm:text-base lg:text-lg font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mt-2 sm:mt-2.5">
                      <a href={`#news-${news.id}`}>
                        {news.headline}
                      </a>
                    </h3>
                    {news.summary && (
                      <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mt-1 line-clamp-2 font-normal">
                        {news.summary}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}

          </div>

          {/* =========================================================================
              SECOND COLUMN (Ratio 1) - Latest Single News From Each Category
              Takes the exact same height as the first column with its own scroll bar
             ========================================================================= */}
          <div className="lg:col-span-1 relative min-h-[380px] lg:min-h-0 lg:h-full">
            <div className="flex flex-col h-full lg:absolute lg:inset-0">
              
              {/* Sidebar Header */}
              <div className="flex items-center gap-2.5 border-b-2 border-slate-900 pb-3 mb-3 shrink-0">
                <span className="w-2.5 h-6 bg-red-600 inline-block"></span>
                <h3 className="font-serif-bangla text-2xl font-bold text-slate-900 tracking-tight">
                  বিভাগ অনুযায়ী সর্বশেষ
                </h3>
              </div>

              {/* Scrollable News List */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 divide-y divide-slate-100 custom-scrollbar">
                {latestCategoryNews.map((item) => (
                  <article
                    key={`${item.categorySlug}-${item.id}`}
                    className="group flex flex-row items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    {/* Image on the left side */}
                    <div className="w-24 h-16 sm:w-28 sm:h-18 shrink-0 overflow-hidden bg-slate-100">
                      <a href={`#news-${item.id}`} className="block w-full h-full">
                        <img
                          src={item.image}
                          alt={item.headline}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </a>
                    </div>

                    {/* Right side: headline and category name on bottom */}
                    <div className="flex flex-col justify-between flex-1 min-w-0 h-full py-0.5">
                      <h4 className="font-serif-bangla text-sm sm:text-[15px] font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                        <a href={`#news-${item.id}`}>
                          {item.headline}
                        </a>
                      </h4>
                      <div className="mt-1.5 flex items-center">
                        <span className="text-xs font-semibold text-red-600 hover:underline">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

