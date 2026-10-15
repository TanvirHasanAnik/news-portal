"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { handpickedNewsList } from "../data/handpickedNewsData";
import { trendingNews } from "../data/newsData";

/**
 * HandpickedNewsSection (বাছাইকৃত সংবাদ)
 * 
 * Column ratio: 2 : 1
 * - First column (Width 2): Handpicked news
 *   - 1 news: Takes the whole space
 *   - 2 news: Divides space and takes horizontal space (side-by-side)
 *   - 3 or 4 news: 2x2 grid with equal square spaces for each corner
 *   - #No borders, no other informations on the card (only image and headline)
 * - Second column (Width 1): Complementary sidebar (Trending / Most Read news)
 */
export default function HandpickedNewsSection({ newsList = handpickedNewsList }) {
  // Ensure we display up to 4 items in the handpicked section
  const displayNews = newsList.slice(0, 4);
  const count = displayNews.length;

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
              SECOND COLUMN (Ratio 1) - Sidebar (সর্বাধিক পঠিত / Trending News)
             ========================================================================= */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Sidebar Header */}
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-3">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <h3 className="font-serif-bangla text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                সর্বাধিক পঠিত
              </h3>
            </div>

            {/* Trending News List */}
            <div className="flex flex-col divide-y divide-slate-100">
              {trendingNews.slice(0, 5).map((item) => (
                <article key={item.id} className="group py-3 first:pt-0 last:pb-0 flex items-start gap-3.5">
                  {/* Rank indicator */}
                  <span className="font-serif-bangla font-extrabold text-2xl text-slate-300 group-hover:text-red-600 transition-colors shrink-0 w-6 text-center leading-none mt-0.5">
                    {item.rank}
                  </span>
                  
                  {/* Headline & views */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif-bangla text-sm sm:text-[15px] font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                      <a href={`#trending-${item.id}`}>
                        {item.headline}
                      </a>
                    </h4>
                    {item.views && (
                      <span className="text-[11px] text-slate-400 mt-1 inline-block">
                        {item.views}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Complementary Advertisement Block */}
            <div className="w-full bg-slate-100/90 rounded-xs flex flex-col items-center justify-center p-4 min-h-[160px] text-center border-dashed border-2 border-slate-200 mt-2">
              <span className="text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                বিজ্ঞাপন
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

