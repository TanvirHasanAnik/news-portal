"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Newspaper,
} from "lucide-react";
import { breakingNews, topHeadlines } from "../data/newsData";

export default function NewsTickerSection() {
  // 1. Breaking News Slider State
  const [currentBreakingIndex, setCurrentBreakingIndex] = useState(0);
  const [isBreakingPlaying, setIsBreakingPlaying] = useState(true);
  const [isHoveredBreaking, setIsHoveredBreaking] = useState(false);

  // Auto-slide breaking news every 4.5 seconds
  useEffect(() => {
    if (!isBreakingPlaying || isHoveredBreaking || breakingNews.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentBreakingIndex((prev) => (prev + 1) % breakingNews.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isBreakingPlaying, isHoveredBreaking]);

  const handleNextBreaking = () => {
    setCurrentBreakingIndex((prev) => (prev + 1) % breakingNews.length);
  };

  const handlePrevBreaking = () => {
    setCurrentBreakingIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);
  };

  const currentBreaking = breakingNews[currentBreakingIndex] || breakingNews[0];

  // 2. Headline (শিরোনাম) Continuous Sliding Ticker State & Logic
  const [isHeadlineHovered, setIsHeadlineHovered] = useState(false);
  const [isHeadlinePlaying, setIsHeadlinePlaying] = useState(true);

  // Duplicate topHeadlines to ensure an infinite seamless loop
  const displayHeadlines =
    topHeadlines.length < 8
      ? [...topHeadlines, ...topHeadlines, ...topHeadlines]
      : [...topHeadlines, ...topHeadlines];

  return (
    <div className="w-full flex flex-col font-sans">
      {/* ======================================================== */}
      {/* 1. BREAKING NEWS SECTION */}
      {/* ======================================================== */}
      <div
        className="w-full bg-red-100 border-b border-red-200/60 text-slate-800 relative overflow-hidden"
        onMouseEnter={() => setIsHoveredBreaking(true)}
        onMouseLeave={() => setIsHoveredBreaking(false)}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Clean Breaking Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 rounded text-white font-semibold text-xs sm:text-sm shrink-0 tracking-wide shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              {/* <Flame className="w-3.5 h-3.5 shrink-0" /> */}
              <span className="whitespace-nowrap">ব্রেকিং নিউজ</span>
            </div>

            {/* Sliding Headline Content */}
            <div className="flex-1 overflow-hidden min-w-0 relative">
              <div
                key={currentBreakingIndex}
                className="flex items-center gap-3 animate-slide-in"
              >
                <a
                  href={currentBreaking.url || "#"}
                  className="text-slate-950 hover:text-red-600 font-medium text-xs sm:text-sm md:text-base truncate transition-colors"
                  title={currentBreaking.headline}
                >
                  {currentBreaking.headline}
                </a>
              </div>
            </div>

            {/* Interactive Slide Controls */}
            <div className="flex items-center gap-1 text-slate-600 shrink-0 border-l border-slate-300/80 pl-2">
              {/* Pagination index */}
              <span className="text-[11px] text-slate-500 font-mono px-1 hidden sm:inline">
                {currentBreakingIndex + 1}/{breakingNews.length}
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
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. HEADLINE SLIDING SECTION (শিরোনাম - Neutral & Professional) */}
      {/* ======================================================== */}
      <div className="w-full bg-slate-100/90 border-b border-slate-200 py-1.5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Neutral & Professional 'শিরোনাম' Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs sm:text-sm font-bold shrink-0 shadow-xs tracking-wide transition-colors z-10">
              <Newspaper className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="whitespace-nowrap">শিরোনাম</span>
            </div>

            {/* Continuous Seamless Sliding Ticker (BD-Pratidin Reference) */}
            <div
              className="flex-1 overflow-hidden relative group"
              onMouseEnter={() => setIsHeadlineHovered(true)}
              onMouseLeave={() => setIsHeadlineHovered(false)}
            >
              {/* Left/Right Subtle Fade Gradients for Polish */}
              <div className="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-slate-100 to-transparent z-1 pointer-events-none" />
              <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-slate-100 to-transparent z-1 pointer-events-none" />

              {/* Infinite Continuous Ticker Container (GPU Compositor Accelerated) */}
              <div
                className="animate-ticker-smooth flex w-max will-change-transform py-1 select-none"
                style={{
                  animationDuration: "180s",
                  animationPlayState:
                    isHeadlinePlaying && !isHeadlineHovered ? "running" : "paused",
                }}
              >
                {/* Primary Track */}
                <div className="flex shrink-0 items-center gap-6 pr-6">
                  {displayHeadlines.map((item, idx) => (
                    <div
                      key={`track1-${item.id}-${idx}`}
                      className="inline-flex items-center gap-3 shrink-0"
                    >
                      <a
                        href={item.url || "#"}
                        className="text-slate-950 hover:text-red-700 font-medium text-xs sm:text-sm md:text-base transition-colors inline-flex items-center gap-1.5"
                      >
                        {item.category && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        )}
                        <span>{item.title}</span>
                      </a>
                      {/* Elegant Separator Diamond */}
                      <span className="text-red-500 text-[10px] select-none font-bold">
                        ◆
                      </span>
                    </div>
                  ))}
                </div>

                {/* Secondary Cloned Track for seamless infinite loop */}
                <div
                  className="flex shrink-0 items-center gap-6 pr-6"
                  aria-hidden="true"
                >
                  {displayHeadlines.map((item, idx) => (
                    <div
                      key={`track2-${item.id}-${idx}`}
                      className="inline-flex items-center gap-3 shrink-0"
                    >
                      <a
                        href={item.url || "#"}
                        tabIndex={-1}
                        className="text-slate-950 hover:text-red-700 font-medium text-xs sm:text-sm md:text-base transition-colors inline-flex items-center gap-1.5"
                      >
                        {item.category && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        )}
                        <span>{item.title}</span>
                      </a>
                      {/* Elegant Separator Diamond */}
                      <span className="text-red-500 text-[10px] select-none font-bold">
                        ◆
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
