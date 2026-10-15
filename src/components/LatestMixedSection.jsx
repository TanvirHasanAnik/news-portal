"use client";

import React from "react";
import { temporaryNewsList, getSortedNewsByTime } from "../data/temporaryNewsData";

export default function LatestMixedSection() {
  // Sorted by time descending
  const sortedNews = getSortedNewsByTime(temporaryNewsList);

  // #1 Most recent news
  const mostRecentStory = sortedNews[0];

  // 2nd, 3rd, 4th, 5th news (for 2nd column square layout)
  const secondColumnStories = sortedNews.slice(1, 5);

  // 6th to 9th news (for 1st column)
  const firstColumnStories = sortedNews.slice(5, 9);

  return (
    <section className="py-6 sm:py-8 bg-white border-b border-slate-200">
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
            
            {/* 1. MOST RECENT NEWS CARD: Takes up first two columns at top */}
            {mostRecentStory && (
              <article className="group flex flex-col md:flex-row items-stretch gap-5 lg:gap-6 bg-transparent">
                {/* Left side: Card image takes full space */}
                <div className="w-full md:w-1/2 lg:w-7/12 shrink-0 overflow-hidden bg-slate-100">
                  <a href={`#news-${mostRecentStory.id}`} className="block h-full w-full">
                    <img
                      src={mostRecentStory.image}
                      alt={mostRecentStory.headline}
                      loading="eager"
                      className="w-full h-full min-h-[220px] sm:min-h-[260px] md:min-h-[300px] lg:min-h-[330px] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
            )}

            {/* Subtle separator between top story and bottom news */}
            <div className="border-b border-slate-200" />

            {/* 2. UNDER LATEST NEWS CARD LAYOUT: 1st Column (Ratio 1) & 2nd Column (Ratio 2) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              
              {/* 1ST COLUMN: Ratio 1 (takes 1 of 3 parts in news area) */}
              {/* Rows of 4 small horizontal cards holding 6th to 9th news */}
              {/* Card layout: first row only image, second row: headline, third row summary */}
              <div className="md:col-span-1 flex flex-col gap-6">
                {firstColumnStories.map((news) => (
                  <article key={news.id} className="group flex flex-col">
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

                    {/* Third row: summary */}
                    {news.summary && (
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mt-1.5 font-normal">
                        {news.summary}
                      </p>
                    )}
                  </article>
                ))}
              </div>

              {/* 2ND COLUMN: Ratio 2 (takes 2 of 3 parts in news area) */}
              {/* Holds square sized news card of 2nd, 3rd, 4th, 5th news in square layout (2x2) */}
              {/* Card layout: first row image left headline right, second row: summary */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-7">
                  {secondColumnStories.map((news) => (
                    <article key={news.id} className="group flex flex-col justify-between">
                      {/* First row: image left, headline right */}
                      <div className="flex flex-row gap-3 items-start">
                        {/* Image left */}
                        <div className="w-24 h-18 sm:w-28 sm:h-20 shrink-0 overflow-hidden bg-slate-100">
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
                        <h3 className="font-serif-bangla text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-3 flex-1 min-w-0">
                          <a href={`#news-${news.id}`}>
                            {news.headline}
                          </a>
                        </h3>
                      </div>

                      {/* Second row: summary */}
                      {news.summary && (
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mt-2.5 font-normal">
                          {news.summary}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
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
              <div className="w-full h-full flex flex-col items-center justify-center py-6 px-3 bg-white/70 rounded-xs">
                <span className="text-xs font-semibold text-slate-700 font-serif-bangla mb-1">
                  এখানে বিজ্ঞাপন দিন
                </span>
                <span className="text-[11px] text-slate-400 mb-3">
                  ৩০০ × ২৫০ পিক্সেল
                </span>
                <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-xs hover:bg-red-700 transition-colors cursor-pointer">
                  যোগাযোগ করুন
                </span>
              </div>
            </div>

            {/* Secondary / Skyscraper Ad Unit (Filling the remaining vertical space in the column) */}
            <div className="w-full bg-slate-100/90 rounded-xs flex flex-col items-center justify-center p-4 min-h-[400px] text-center border-dashed border-2 border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                বিজ্ঞাপন
              </span>
              <div className="w-full h-full flex flex-col items-center justify-center py-8 px-3 bg-white/70 rounded-xs">
                <span className="text-xs font-semibold text-slate-700 font-serif-bangla mb-1">
                  বিশেষ বাণিজ্যিক বিজ্ঞাপন
                </span>
                <span className="text-[11px] text-slate-400 mb-4">
                  ৩০০ × ৬০০ পিক্সেল
                </span>
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-sm mb-3">
                  Ad
                </div>
                <p className="text-xs text-slate-500 max-w-[180px] leading-relaxed">
                  আপনার প্রতিষ্ঠানের প্রচার ও প্রসারে আমাদের সাথে যুক্ত হোন
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
