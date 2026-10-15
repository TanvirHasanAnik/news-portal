"use client";

import React from "react";
import NewsArticleCard from "./NewsArticleCard";
import { temporaryNewsList, getSortedNewsByTime } from "../data/temporaryNewsData";

export default function LatestMixedSection() {
  // Sorted by time descending (time is kept strictly on objects for sorting; not shown in UI)
  const sortedNews = getSortedNewsByTime(temporaryNewsList);

  // #1 most recent story (emphasized) and companion stories (#2 and #3)
  const mostRecentStory = sortedNews[0];
  const companionStories = sortedNews.slice(1, 3);

  return (
    <section className="py-8 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Content Grid: Emphasizing the Most Recent One (#1) alongside #2 & #3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* #1 MOST RECENT STORY - EMPHASIZED HERO (Takes 7 columns on desktop) */}
          <div className="lg:col-span-7">
            <NewsArticleCard
              news={mostRecentStory}
              variant="emphasized"
              showTime={false}
              className="h-full ring-2 ring-red-600/20 shadow-md"
            />
          </div>

          {/* #2 & #3 COMPANION STORIES (Takes 5 columns on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-4 flex-1">
              {companionStories.map((story) => (
                <NewsArticleCard
                  key={story.id}
                  news={story}
                  variant="horizontal"
                  showTime={false}
                  className="flex-1"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
