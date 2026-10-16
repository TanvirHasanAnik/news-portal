import React from "react";
import { temporaryNewsList, getSortedNewsByTime } from "../data/temporaryNewsData";

export default function LatestMixedSection() {
  // Sorted by time descending
  const sortedNews = getSortedNewsByTime(temporaryNewsList);

  // #1 Most recent news
  const mostRecentStory = sortedNews[0];

  // Mobile: 2nd to 7th news (6 stories, 3 rows x 2 cols)
  const mobileGridStories = sortedNews.slice(1, 7);

  // Mobile: 8th and 9th news (2 stories, vertical card in single column on bottom)
  const mobileBottomStories = sortedNews.slice(7, 9);

  // Desktop: 2nd, 3rd, 4th, 5th news (2nd column)
  const secondColumnStories = sortedNews.slice(1, 5);

  // Desktop: 6th to 9th news (1st column)
  const firstColumnStories = sortedNews.slice(5, 9);

  return (
    <section id="latest" className="scroll-mt-14 py-6 sm:py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Column Ratio 1 : 2 : 1 */}
        {/* On desktop (lg): 4 columns total. 
            Col 1 + Col 2 = 3 parts (takes lg:col-span-3)
            Col 3 = 1 part (takes lg:col-span-1 for ad space)
            Inside Col 1 + Col 2: 
              Col 1 takes 1 part (ratio 1)
              Col 2 takes 2 parts (ratio 2)
            Total ratio across section: 1 : 2 : 1
        */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          
          {/* First Two Columns Area (Width ratio 1 + 2 = 3) */}
          <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-8">
            
            {/* 1. MOST RECENT NEWS CARD */}
            {mostRecentStory && (
              <>
                {/* Mobile View: Headline on top, Image on mid, Summary at bottom */}
                <article className="group flex flex-col gap-3 md:hidden">
                  {/* Headline on top */}
                  <h2 className="font-serif-bangla text-xl sm:text-2xl font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors">
                    <a href={`#news-${mostRecentStory.id}`}>
                      {mostRecentStory.headline}
                    </a>
                  </h2>

                  {/* Image on mid */}
                  <div className="w-full aspect-[16/10] overflow-hidden bg-slate-100">
                    <a href={`#news-${mostRecentStory.id}`} className="block h-full w-full">
                      <img
                        src={mostRecentStory.image}
                        alt={mostRecentStory.headline}
                        loading="eager"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </a>
                  </div>

                  {/* Summary at bottom */}
                  {mostRecentStory.summary && (
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 font-normal">
                      {mostRecentStory.summary}
                    </p>
                  )}
                </article>

                {/* Desktop View: Image on left, Headline & Summary on right */}
                <article className="group hidden md:flex md:flex-row items-stretch gap-5 lg:gap-6 bg-transparent">
                  {/* Left side: Card image takes full space */}
                  <div className="w-full md:w-1/2 lg:w-7/12 shrink-0 overflow-hidden bg-slate-100">
                    <a href={`#news-${mostRecentStory.id}`} className="block h-full w-full">
                      <img
                        src={mostRecentStory.image}
                        alt={mostRecentStory.headline}
                        loading="eager"
                        className="w-full h-full min-h-[300px] lg:min-h-[330px] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </a>
                  </div>

                  {/* Right side: Headline and Summary */}
                  <div className="flex flex-col justify-center flex-1 py-1 md:py-2">
                    <h2 className="font-serif-bangla text-2xl sm:text-3xl lg:text-[28px] xl:text-3xl font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors">
                      <a href={`#news-${mostRecentStory.id}`}>
                        {mostRecentStory.headline}
                      </a>
                    </h2>
                    {mostRecentStory.summary && (
                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3.5 line-clamp-4 font-normal">
                        {mostRecentStory.summary}
                      </p>
                    )}
                  </div>
                </article>
              </>
            )}

            {/* Subtle separator between top story and bottom news */}
            <div className="border-b border-slate-200" />

            {/* 2. MOBILE VIEW: 2nd to 7th news in 2-column grid (3 rows x 2 cols), square-shaped cards */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:hidden">
              {mobileGridStories.map((news) => (
                <article
                  key={news.id}
                  className="group flex flex-col"
                >
                  {/* Square-shaped image */}
                  <div className="w-full aspect-square overflow-hidden bg-slate-100">
                    <a href={`#news-${news.id}`} className="block h-full w-full">
                      <img
                        src={news.image}
                        alt={news.headline}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </a>
                  </div>

                  {/* Headline */}
                  <h3 className="font-serif-bangla text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mt-2">
                    <a href={`#news-${news.id}`}>
                      {news.headline}
                    </a>
                  </h3>
                </article>
              ))}
            </div>

            {/* Subtle separator between 2-col grid and bottom vertical news on mobile */}
            {mobileBottomStories.length > 0 && (
              <div className="border-b border-slate-200 md:hidden" />
            )}

            {/* 3. MOBILE VIEW: 8th and 9th news as horizontal cards (image left, headline & summary right) */}
            {mobileBottomStories.length > 0 && (
              <div className="flex flex-col gap-4 sm:gap-5 md:hidden">
                {mobileBottomStories.map((news) => (
                  <article
                    key={news.id}
                    className="group flex flex-row gap-3.5 sm:gap-4 items-start"
                  >
                    {/* Left side: Image */}
                    <div className="w-28 sm:w-32 aspect-[4/3] shrink-0 overflow-hidden bg-slate-100">
                      <a href={`#news-${news.id}`} className="block h-full w-full">
                        <img
                          src={news.image}
                          alt={news.headline}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </a>
                    </div>

                    {/* Right side: Headline and Summary */}
                    <div className="flex flex-col justify-start flex-1 min-w-0">
                      <h3 className="font-serif-bangla text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                        <a href={`#news-${news.id}`}>
                          {news.headline}
                        </a>
                      </h3>

                      {news.summary && (
                        <p className="text-slate-600 text-xs sm:text-[13px] line-clamp-2 leading-relaxed mt-1.5 font-normal">
                          {news.summary}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* 4. DESKTOP VIEW: 1st Column (Ratio 1) & 2nd Column (Ratio 2) */}
            {/* Equal height container: items-stretch ensures both columns have the exact same height */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              
              {/* 1ST COLUMN: Ratio 1 (takes 1 of 3 parts in news area) */}
              {/* Card design swapped from 2nd col: first row image left headline right, second row summary */}
              <div className="md:col-span-1 flex flex-col justify-between h-full gap-4 lg:gap-5">
                {firstColumnStories.map((news) => (
                  <article
                    key={news.id}
                    className="group flex flex-col justify-between flex-1 py-0.5"
                  >
                    {/* First row: image left, headline right */}
                    <div className="flex flex-row gap-3 items-start">
                      {/* Image left */}
                      <div className="w-24 h-16 sm:w-26 sm:h-18 md:w-20 md:h-16 lg:w-24 lg:h-18 shrink-0 overflow-hidden bg-slate-100">
                        <a href={`#news-${news.id}`} className="block h-full w-full">
                          <img
                            src={news.image}
                            alt={news.headline}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </a>
                      </div>

                      {/* Headline right */}
                      <h3 className="font-serif-bangla text-sm lg:text-[15px] font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 flex-1 min-w-0">
                        <a href={`#news-${news.id}`}>
                          {news.headline}
                        </a>
                      </h3>
                    </div>

                    {/* Second row: summary */}
                    {news.summary && (
                      <p className="text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed mt-2 font-normal">
                        {news.summary}
                      </p>
                    )}
                  </article>
                ))}
              </div>

              {/* 2ND COLUMN: Ratio 2 (takes 2 of 3 parts in news area) */}
              {/* Card design swapped from 1st col: first row only image, second row headline, third row summary */}
              {/* 2x2 grid kept at same height matching 1st column */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 h-full content-between">
                {secondColumnStories.map((news) => (
                  <article
                    key={news.id}
                    className="group flex flex-col justify-between h-full"
                  >
                    <div>
                      {/* First row: only image */}
                      <div className="w-full aspect-[16/10] overflow-hidden bg-slate-100">
                        <a href={`#news-${news.id}`} className="block h-full w-full">
                          <img
                            src={news.image}
                            alt={news.headline}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </a>
                      </div>

                      {/* Second row: headline */}
                      <h3 className="font-serif-bangla text-base font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mt-2.5">
                        <a href={`#news-${news.id}`}>
                          {news.headline}
                        </a>
                      </h3>
                    </div>

                    {/* Third row: summary */}
                    {news.summary && (
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mt-1.5 font-normal">
                        {news.summary}
                      </p>
                    )}
                  </article>
                ))}
              </div>

            </div>
          </div>

          {/* 3RD COLUMN: Ratio 1 (takes remaining 1 of 4 columns) */}
          {/* Beside the latest news card the remaining column will fill ad space */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Top Ad Unit (Positioned right beside the latest news card) */}
            <div className="w-full bg-slate-100/90 rounded-xs flex flex-col items-center justify-center p-4 min-h-[280px] lg:min-h-[330px] text-center border-dashed border-2 border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                বিজ্ঞাপন
              </span>
            </div>

            {/* Bottom Ad Unit */}
            <div className="w-full bg-slate-100/90 rounded-xs flex flex-col items-center justify-center p-4 min-h-[280px] lg:min-h-[330px] text-center border-dashed border-2 border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                বিজ্ঞাপন
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
