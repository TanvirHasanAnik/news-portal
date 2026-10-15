"use client";

import React, { useState } from "react";
import { Clock, MapPin, Share2, Bookmark, Check } from "lucide-react";

/**
 * Requirement 1: News Article Card
 * Properties:
 * - Featured image
 * - Headline
 * - Article summary paragraph
 * - Publish time
 * 
 * Supports variants:
 * - 'emphasized' (Featured large card with highlighted visuals)
 * - 'standard' (Classic vertical editorial card)
 * - 'horizontal' (Editorial horizontal split card for secondary stories)
 */
export default function NewsArticleCard({
  news,
  variant = "standard",
  showCategory = true,
  showTime = false,
  className = "",
  imageClassName = "",
}) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  if (!news) return null;

  const {
    id,
    category,
    categorySlug,
    headline,
    summary,
    image,
    publishedAt,
    time,
    author,
    location,
    isMostRecent,
  } = news;

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  // 1. EMPHASIZED VARIANT (Hero item in "Latest 3" sections)
  if (variant === "emphasized") {
    return (
      <article
        className={`group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      >
        {/* Featured Image */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <img
            src={image}
            alt={headline}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 items-center">
            {showCategory && category && (
              <span className="inline-block rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm tracking-wide">
                {category}
              </span>
            )}
            {isMostRecent && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/95 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-slate-900 shadow-sm animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                এইমাত্র প্রকাশিত
              </span>
            )}
          </div>

          {/* Action icons */}
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/60 backdrop-blur-sm rounded-lg p-1 text-white">
            <button
              onClick={handleBookmark}
              title={bookmarked ? "সংরক্ষিত" : "সংরক্ষণ করুন"}
              className={`p-1.5 rounded hover:bg-white/20 transition-colors ${
                bookmarked ? "text-amber-400" : "text-white"
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              title="লিংক কপি করুন"
              className="p-1.5 rounded hover:bg-white/20 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
          <div>
            {/* Headline */}
            <h3 className="font-serif-bangla text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-2 mb-2.5">
              <a href={`#news-${id}`} className="focus:outline-none focus:underline">
                {headline}
              </a>
            </h3>

            {/* Article Summary Paragraph */}
            {summary && (
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4 font-normal">
                {summary}
              </p>
            )}
          </div>

          {/* Metadata Footer: Publish time, Author, Location */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2 flex-wrap">
              {author && (
                <span className="font-medium text-slate-700">
                  {author}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-0.5 text-slate-400">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {location}
                </span>
              )}
            </div>

            {showTime && (publishedAt || time) && (
              <div className="flex items-center gap-1 font-medium text-slate-500 shrink-0">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>{publishedAt || time}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  // 2. HORIZONTAL VARIANT (Clean, side-by-side thumbnail for companion news)
  if (variant === "horizontal") {
    return (
      <article
        className={`group relative flex gap-3.5 sm:gap-4 overflow-hidden rounded-xl bg-white p-3 sm:p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 ${className}`}
      >
        {/* Featured Image Thumbnail */}
        <div className="relative aspect-[4/3] w-28 sm:w-36 md:w-40 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <img
            src={image}
            alt={headline}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {showCategory && category && (
            <span className="absolute bottom-1.5 left-1.5 rounded bg-slate-900/80 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-medium text-white">
              {category}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            {/* Headline */}
            <h3 className="font-serif-bangla text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-2 mb-1.5">
              <a href={`#news-${id}`} className="focus:outline-none">
                {headline}
              </a>
            </h3>

            {/* Article Summary Paragraph */}
            {summary && (
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-2 hidden sm:block">
                {summary}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            {location && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {location}
              </span>
            )}

            {showTime && (publishedAt || time) && (
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3 text-red-600" />
                {publishedAt || time}
              </span>
            )}
          </div>
        </div>
      </article>
    );
  }

  // 3. STANDARD VERTICAL VARIANT
  return (
    <article
      className={`group flex flex-col justify-between overflow-hidden rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 ${className}`}
    >
      {/* Featured Image */}
      <div
        className={`relative aspect-[16/9] sm:aspect-[2.2/1] max-h-[170px] sm:max-h-[190px] md:max-h-[200px] w-full overflow-hidden bg-slate-100 ${imageClassName}`}
      >
        <img
          src={image}
          alt={headline}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {showCategory && category && (
          <span className="absolute top-2.5 left-2.5 rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs">
            {category}
          </span>
        )}
        {isMostRecent && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded bg-amber-500/95 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-xs animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
            এইমাত্র প্রকাশিত
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Headline */}
          <h3 className="font-serif-bangla text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-2 mb-2">
            <a href={`#news-${id}`} className="focus:outline-none">
              {headline}
            </a>
          </h3>

          {/* Article Summary Paragraph */}
          {summary && (
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-3">
              {summary}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          {author && (
            <span className="text-slate-600 font-medium text-[11px] truncate max-w-[120px]">
              {author}
            </span>
          )}

          {showTime && (publishedAt || time) && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-red-600" />
              <span>{publishedAt || time}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

