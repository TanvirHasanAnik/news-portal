"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Newspaper,
} from "lucide-react";

export default function NewsTickerSection({ breakingNewsList = [], headlines = [] }) {
  const hasBreakingNews = Array.isArray(breakingNewsList) && breakingNewsList.length > 0;
  const [currentBreakingIndex, setCurrentBreakingIndex] = useState(0);
  const [isBreakingPlaying, setIsBreakingPlaying] = useState(true);
  const [isHoveredBreaking, setIsHoveredBreaking] = useState(false);

  useEffect(() => {
    if (!hasBreakingNews || !isBreakingPlaying || isHoveredBreaking || breakingNewsList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentBreakingIndex((prev) => (prev + 1) % breakingNewsList.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [hasBreakingNews, isBreakingPlaying, isHoveredBreaking, breakingNewsList.length]);

  const handleNextBreaking = () => {
    if (!hasBreakingNews || breakingNewsList.length <= 1) return;
    setCurrentBreakingIndex((prev) => (prev + 1) % breakingNewsList.length);
  };

  const handlePrevBreaking = () => {
    if (!hasBreakingNews || breakingNewsList.length <= 1) return;
    setCurrentBreakingIndex((prev) => (prev - 1 + breakingNewsList.length) % breakingNewsList.length);
  };

  const currentBreaking = hasBreakingNews ? breakingNewsList[currentBreakingIndex] || breakingNewsList[0] : null;

  const [isHeadlineHovered, setIsHeadlineHovered] = useState(false);
  const [isHeadlinePlaying, setIsHeadlinePlaying] = useState(true);

  const rawHeadlines = (headlines || []).slice(0, 3);
  const hasHeadlines = rawHeadlines.length > 0;

  const displayHeadlines = rawHeadlines.length === 1
    ? [...rawHeadlines, ...rawHeadlines, ...rawHeadlines, ...rawHeadlines]
    : rawHeadlines.length === 2
    ? [...rawHeadlines, ...rawHeadlines, ...rawHeadlines]
    : [...rawHeadlines, ...rawHeadlines];

  return (
    <div className="w-full flex flex-col font-sans">
      {hasBreakingNews && currentBreaking && (
        <div
          className="w-full bg-red-100 border-b border-red-200/60 text-slate-800 relative overflow-hidden"
          onMouseEnter={() => setIsHoveredBreaking(true)}
          onMouseLeave={() => setIsHoveredBreaking(false)}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 rounded text-white font-semibold text-xs sm:text-sm shrink-0 tracking-wide shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="whitespace-nowrap">ব্রেকিং নিউজ</span>
              </div>

              <div className="flex-1 overflow-hidden min-w-0 relative">
                <div
                  key={currentBreakingIndex}
                  className="flex items-center gap-3 animate-slide-in"
                >
                  <Link
                    href={currentBreaking.url || "#"}
                    className="text-slate-950 hover:text-red-600 font-medium text-xs sm:text-sm md:text-base truncate transition-colors"
                    title={currentBreaking.headline}
                  >
                    {currentBreaking.headline}
                  </Link>
                </div>
              </div>

              {breakingNewsList.length > 1 && (
                <div className="flex items-center gap-1 text-slate-600 shrink-0 border-l border-slate-300/80 pl-2">
                  <span className="text-[11px] text-slate-500 font-mono px-1 hidden sm:inline">
                    {currentBreakingIndex + 1}/{breakingNewsList.length}
                  </span>

                  <button
                    onClick={handlePrevBreaking}
                    className="p-1 rounded hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition-colors"
                    aria-label="পূর্ববর্তী ব্রেকিং নিউজ"
                    title="পূর্ববর্তী সংবাদ"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsBreakingPlaying(!isBreakingPlaying)}
                    className="p-1 rounded hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition-colors"
                    aria-label={isBreakingPlaying ? "বিরতি" : "চালু"}
                    title={isBreakingPlaying ? "বিরতি" : "চালু"}
                  >
                    {isBreakingPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={handleNextBreaking}
                    className="p-1 rounded hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition-colors"
                    aria-label="পরবর্তী ব্রেকিং নিউজ"
                    title="পরবর্তী সংবাদ"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-slate-100/90 border-b border-slate-200 py-1.5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs sm:text-sm font-bold shrink-0 shadow-xs tracking-wide transition-colors z-10">
              <Newspaper className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="whitespace-nowrap">শিরোনাম</span>
            </div>

            {!hasHeadlines ? (
              <div className="flex-1 text-xs sm:text-sm text-slate-500 font-medium py-1">
                বর্তমানে কোনো শিরোনাম সংবাদ নেই
              </div>
            ) : (
              <div
                className="flex-1 overflow-hidden relative group"
                onMouseEnter={() => setIsHeadlineHovered(true)}
                onMouseLeave={() => setIsHeadlineHovered(false)}
              >
                <div className="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-slate-100 to-transparent z-1 pointer-events-none" />
                <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-slate-100 to-transparent z-1 pointer-events-none" />

                <div
                  className="animate-ticker-smooth flex w-max will-change-transform py-1 select-none"
                  style={{
                    animationDuration: `${Math.max(60, displayHeadlines.length * 15)}s`,
                    animationPlayState:
                      isHeadlinePlaying && !isHeadlineHovered ? "running" : "paused",
                  }}
                >
                  <div className="flex shrink-0 items-center gap-6 pr-6">
                    {displayHeadlines.map((item, idx) => {
                      const articleUrl = item.slug ? `/article/${item.slug}` : (item.id ? `/article/${item.id}` : (item.url || "#"));
                      const headlineText = item.headline || item.title || "";
                      const categoryName = item.category || item.category_name;
                      return (
                        <div
                          key={`track1-${item.id || item.slug || idx}-${idx}`}
                          className="inline-flex items-center gap-3 shrink-0"
                        >
                          <Link
                            href={articleUrl}
                            className="text-slate-950 hover:text-red-700 font-medium text-xs sm:text-sm md:text-base transition-colors inline-flex items-center gap-1.5"
                          >
                            {categoryName && (
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                                {categoryName}
                              </span>
                            )}
                            <span>{headlineText}</span>
                          </Link>
                          <span className="text-red-500 text-[10px] select-none font-bold">
                            ◆
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="flex shrink-0 items-center gap-6 pr-6"
                    aria-hidden="true"
                  >
                    {displayHeadlines.map((item, idx) => {
                      const articleUrl = item.slug ? `/article/${item.slug}` : (item.id ? `/article/${item.id}` : (item.url || "#"));
                      const headlineText = item.headline || item.title || "";
                      const categoryName = item.category || item.category_name;
                      return (
                        <div
                          key={`track2-${item.id || item.slug || idx}-${idx}`}
                          className="inline-flex items-center gap-3 shrink-0"
                        >
                          <Link
                            href={articleUrl}
                            tabIndex={-1}
                            className="text-slate-950 hover:text-red-700 font-medium text-xs sm:text-sm md:text-base transition-colors inline-flex items-center gap-1.5"
                          >
                            {categoryName && (
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                                {categoryName}
                              </span>
                            )}
                            <span>{headlineText}</span>
                          </Link>
                          <span className="text-red-500 text-[10px] select-none font-bold">
                            ◆
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
