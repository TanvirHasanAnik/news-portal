"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Flame, Bell } from "lucide-react";
import { breakingNews } from "../data/newsData";

export default function BreakingNewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || breakingNews.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);
  };

  const currentItem = breakingNews[currentIndex] || breakingNews[0];

  return (
    <div className="w-full bg-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-3">
          {/* Breaking News Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shrink-0 tracking-wide shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Flame className="w-3.5 h-3.5" />
            <span>ব্রেকিং নিউজ</span>
          </div>

          {/* Headline Display Area */}
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="flex items-center justify-between gap-3 animate-fadeIn">
              <a
                href={currentItem.url}
                className="text-slate-800 hover:text-red-700 font-medium text-xs sm:text-sm truncate transition-colors font-serif-bangla"
              >
                {currentItem.headline}
              </a>
              <span className="text-[11px] text-slate-400 shrink-0 hidden sm:inline">
                {currentItem.time}
              </span>
            </div>
          </div>

          {/* Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-1 text-slate-500 shrink-0 border-l border-slate-300 pl-2">
            <button
              onClick={handlePrev}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label="পূর্ববর্তী সংবাদ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label={isPlaying ? "বিরতি" : "চালু"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label="পরবর্তী সংবাদ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

