"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Clock, Layers, Flame } from "lucide-react";
import NewsArticleCard from "./NewsArticleCard";
import { latestMixedNews } from "../data/newsData";

/**
 * Requirement 2:
 * Latest mixed category published section:
 * Latest 3 news emphasizing most recent one with see more
 */
export default function LatestMixedSection() {
  const [activeTab, setActiveTab] = useState("all");

  // The 3 latest news items
  const mostRecentStory = latestMixedNews[0]; // Emphasized #1
  const companionStories = latestMixedNews.slice(1, 3); // Items #2 and #3

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
                  className="flex-1"
                />
              ))}
            </div>

            {/* Bottom See More Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-3.5 text-white flex items-center justify-between shadow-xs">
              <div>
                <h4 className="font-bold text-sm font-serif-bangla">সব বিভাগের সর্বশেষ খবর পেতে চান?</h4>
                <p className="text-[11px] text-red-100">প্রতি মিনিটে আপডেট হচ্ছে আমাদের সংবাদ প্রবাহ</p>
              </div>
              <a
                href="#all-latest"
                className="shrink-0 bg-white text-red-700 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-md shadow-xs transition-colors flex items-center gap-1"
              >
                আরও দেখুন
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

