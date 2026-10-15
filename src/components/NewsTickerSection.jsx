"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Newspaper,
  Clock,
  Sparkles,
} from "lucide-react";
import { breakingNews, topHeadlines } from "../data/newsData";

export default function NewsTickerSection() {
  // Breaking News Slider State
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

  // Duplicate topHeadlines to ensure an infinite seamless loop
  const tickerItems = [...topHeadlines, ...topHeadlines];

  return (
    <div className="w-full flex flex-col font-sans">
      {/* ======================================================== */}
      {/* 1. BREAKING NEWS SECTION (High Attraction / Attention-Grabbing) */}
      {/* ======================================================== */}
      <div
        className="w-full bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white shadow-sm border-b border-red-800/80 relative overflow-hidden"
        onMouseEnter={() => setIsHoveredBreaking(true)}
        onMouseLeave={() => setIsHoveredBreaking(false)}
      >
        {/* Subtle background ambient pulse glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Eye-Catching Breaking Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/35 hover:bg-black/45 border border-white/20 rounded-md text-white font-bold text-xs sm:text-sm shrink-0 tracking-wide backdrop-blur-xs shadow-xs transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
              <Flame className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="whitespace-nowrap">ব্রেকিং নিউজ</span>
            </div>

            {/* Sliding Headline Content */}
            <div className="flex-1 overflow-hidden min-w-0 relative">
              <div
                key={currentBreakingIndex}
                className="flex items-center justify-between gap-3 animate-in fade-in slide-in-from-right-3 duration-300"
              >
                <a
                  href={currentBreaking.url || "#"}
                  className="text-white hover:text-amber-200 font-medium text-xs sm:text-sm md:text-[15px] truncate transition-colors drop-shadow-xs"
                  title={currentBreaking.headline}
                >
                  {currentBreaking.headline}
                </a>

                {/* Time Stamp Badge */}
                {currentBreaking.time && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/25 text-red-100 text-[11px] font-normal shrink-0 hidden md:inline-flex whitespace-nowrap">
                    <Clock className="w-3 h-3 text-amber-300" />
                    {currentBreaking.time}
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Slide Controls */}
            <div className="flex items-center gap-1 text-white/90 shrink-0 border-l border-white/20 pl-2">
              {/* Pagination index */}
              <span className="text-[11px] text-white/75 font-mono px-1 hidden sm:inline">
                {currentBreakingIndex + 1}/{breakingNews.length}
              </span>

              <button
                onClick={handlePrevBreaking}
                className="p-1 rounded hover:bg-black/20 text-white/90 hover:text-white transition-colors"
                aria-label="পূর্ববর্তী ব্রেকিং নিউজ"
                title="পূর্ববর্তী সংবাদ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsBreakingPlaying(!isBreakingPlaying)}
                className="p-1 rounded hover:bg-black/20 text-white/90 hover:text-white transition-colors"
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
                className="p-1 rounded hover:bg-black/20 text-white/90 hover:text-white transition-colors"
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
            <div className="flex-1 overflow-hidden relative group">
              {/* Left/Right Subtle Fade Gradients for Polish */}
              <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-slate-100 to-transparent z-1 pointer-events-none" />
              <div className="absolute right-0 inset-y-0 w-6 bg-gradient-to-l from-slate-100 to-transparent z-1 pointer-events-none" />

              {/* Infinite Continuous Ticker */}
              <div className="animate-ticker flex items-center gap-6 py-0.5 whitespace-nowrap">
                {tickerItems.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex items-center gap-3 shrink-0">
                    <a
                      href={item.url || "#"}
                      className="text-slate-800 hover:text-red-700 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                    >
                      {item.category && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                      )}
                      <span>{item.title}</span>
                    </a>
                    {/* Elegant Separator Diamond */}
                    <span className="text-red-500 text-[10px] select-none font-bold">◆</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

