import React from "react";
import NewsCard from "./NewsCard";
import AdHolder from "./AdHolder";
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
                <NewsCard
                  news={mostRecentStory}
                  variant="vertical"
                  reverseOrder={true}
                  imageAspect="aspect-[16/10]"
                  headlineTag="h2"
                  headlineSize="text-xl sm:text-2xl"
                  summaryClamp="line-clamp-3"
                  summarySize="text-sm"
                  imagePriority={true}
                  className="gap-3 md:hidden"
                />

                {/* Desktop View: Image on left, Headline & Summary on right */}
                <NewsCard
                  news={mostRecentStory}
                  variant="hero"
                  headlineTag="h2"
                  headlineSize="text-2xl sm:text-3xl lg:text-[28px] xl:text-3xl"
                  summaryClamp="line-clamp-4"
                  summarySize="text-sm sm:text-base mt-3.5"
                  imageWrapperClassName="min-h-[300px] lg:min-h-[330px]"
                  imagePriority={true}
                  className="hidden md:flex"
                />
              </>
            )}

            {/* Subtle separator between top story and bottom news */}
            <div className="border-b border-slate-200" />

            {/* 2. MOBILE VIEW: 2nd to 7th news in 2-column grid (3 rows x 2 cols), square-shaped cards */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:hidden">
              {mobileGridStories.map((news) => (
                <NewsCard
                  key={news.id}
                  news={news}
                  variant="compact"
                  imageAspect="aspect-square"
                  headlineTag="h3"
                  headlineSize="text-xs sm:text-sm mt-2"
                  showSummary={false}
                />
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
                  <NewsCard
                    key={news.id}
                    news={news}
                    variant="horizontal"
                    imageWrapperClassName="w-28 sm:w-32 aspect-[4/3]"
                    headlineTag="h3"
                    headlineSize="text-sm sm:text-base"
                    showSummary={true}
                    summaryClamp="line-clamp-2"
                    summarySize="text-xs sm:text-[13px] mt-1.5"
                  />
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
                  <NewsCard
                    key={news.id}
                    news={news}
                    variant="row-summary"
                    imageWrapperClassName="w-24 h-16 sm:w-26 sm:h-18 md:w-20 md:h-16 lg:w-24 lg:h-18"
                    headlineTag="h3"
                    headlineSize="text-sm lg:text-[15px]"
                    showSummary={true}
                    summaryClamp="line-clamp-2"
                    summarySize="text-xs sm:text-[13px] mt-2"
                    className="flex-1 py-0.5"
                  />
                ))}
              </div>

              {/* 2ND COLUMN: Ratio 2 (takes 2 of 3 parts in news area) */}
              {/* Card design swapped from 1st col: first row only image, second row headline, third row summary */}
              {/* 2x2 grid kept at same height matching 1st column */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 h-full content-between">
                {secondColumnStories.map((news) => (
                  <NewsCard
                    key={news.id}
                    news={news}
                    variant="vertical"
                    imageAspect="aspect-[16/10]"
                    headlineTag="h3"
                    headlineSize="text-base mt-2.5"
                    showSummary={true}
                    summaryClamp="line-clamp-2"
                    summarySize="text-xs sm:text-sm mt-1.5"
                    className="h-full"
                  />
                ))}
              </div>

            </div>
          </div>

          {/* 3RD COLUMN: Ratio 1 (takes remaining 1 of 4 columns) */}
          {/* Standard ad unit placement in the side column */}
          <div className="lg:col-span-1 flex flex-col gap-6 items-center">
            {/* Top Ad Unit: Medium Rectangle (300 × 250) */}
            <AdHolder size="300x250" />

            {/* Bottom Ad Unit: Medium Rectangle (300 × 250) */}
            <AdHolder size="300x250" />
          </div>

        </div>
      </div>
    </section>
  );
}
