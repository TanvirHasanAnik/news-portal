"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Flame } from "lucide-react";
import { breakingNews } from "../data/newsData";

/**
 * BreakingNewsTicker - BD-Pratidin inspired smooth horizontal sliding ticker.
 * Uses GPU-accelerated translate3d on the compositor thread for silky-smooth 60/120fps motion.
 */
export default function BreakingNewsTicker({
  items = breakingNews,
  speed = 160, // very slow, relaxed reading pace in seconds
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Fallback to breakingNews if items are empty
  const safeItems = items && items.length > 0 ? items : breakingNews;

  // Duplicate items to ensure wide coverage across all screen sizes (including 4K/ultrawide)
  const displayItems = safeItems.length < 8 ? [...safeItems, ...safeItems, ...safeItems] : safeItems;

  return (
    <div
      className="w-full bg-red-50/90 border-b border-red-200/80 text-slate-900 select-none overflow-hidden"
      role="region"
      aria-label="ব্রেকিং নিউজ টিকার"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Breaking News Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded font-bold text-xs sm:text-sm shrink-0 tracking-wide shadow-xs z-10">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="whitespace-nowrap">ব্রেকিং নিউজ</span>
          </div>

          {/* Continuous Sliding Ticker (BD-Pratidin Style) */}
          <div
            className="flex-1 overflow-hidden relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Left and Right Edge Polish Gradients */}
            <div
              className="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-red-50 to-transparent z-1 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-red-50 to-transparent z-1 pointer-events-none"
              aria-hidden="true"
            />

            {/* GPU Compositor-Accelerated Infinite Track Wrapper */}
            <div
              className="animate-ticker-smooth flex w-max will-change-transform py-0.5"
              style={{
                animationDuration: `${speed}s`,
                animationPlayState: isPlaying && !isHovered ? "running" : "paused",
              }}
            >
              {/* Primary Track */}
              <div className="flex shrink-0 items-center gap-6 pr-6">
                {displayItems.map((item, idx) => (
                  <div
                    key={`track1-${item.id || idx}-${idx}`}
                    className="flex items-center gap-3 shrink-0"
                  >
                    <a
                      href={item.url || "#"}
                      className="text-slate-900 hover:text-red-700 font-medium text-xs sm:text-sm md:text-[15px] transition-colors font-serif-bangla flex items-center gap-2"
                      title={item.headline}
                    >
                      {item.time && (
                        <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-red-600 bg-red-100/90 px-1.5 py-0.5 rounded border border-red-200 shrink-0">
                          {item.time}
                        </span>
                      )}
                      <span>{item.headline}</span>
                    </a>
                    {/* Visual Separator */}
                    <span className="text-red-500 text-[10px] select-none font-bold" aria-hidden="true">
                      ◆
                    </span>
                  </div>
                ))}
              </div>

              {/* Cloned Secondary Track for seamless 0ms infinite loop */}
              <div
                className="flex shrink-0 items-center gap-6 pr-6"
                aria-hidden="true"
              >
                {displayItems.map((item, idx) => (
                  <div
                    key={`track2-${item.id || idx}-${idx}`}
                    className="flex items-center gap-3 shrink-0"
                  >
                    <a
                      href={item.url || "#"}
                      tabIndex={-1}
                      className="text-slate-900 hover:text-red-700 font-medium text-xs sm:text-sm md:text-[15px] transition-colors font-serif-bangla flex items-center gap-2"
                    >
                      {item.time && (
                        <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-red-600 bg-red-100/90 px-1.5 py-0.5 rounded border border-red-200 shrink-0">
                          {item.time}
                        </span>
                      )}
                      <span>{item.headline}</span>
                    </a>
                    <span className="text-red-500 text-[10px] select-none font-bold">
                      ◆
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls: Play/Pause Toggle */}
          <div className="flex items-center gap-1 text-slate-600 shrink-0 border-l border-red-200 pl-2 z-10">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded hover:bg-red-100 text-slate-700 hover:text-red-700 transition-colors"
              aria-label={isPlaying ? "টিকার বিরতি দিন (Pause)" : "টিকার চালু করুন (Play)"}
              title={isPlaying ? "বিরতি দিন" : "চালু করুন"}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
