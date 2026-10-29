"use client";

import React, { useState } from "react";
import { Share2, Bookmark, Check } from "lucide-react";

export default function ArticleActions({
  className = "",
  buttonClassName = "p-1.5 rounded hover:bg-white/20 transition-colors",
}) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  return (
    <div
      className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/60 backdrop-blur-sm rounded-lg p-1 text-white ${className}`}
    >
      <button
        onClick={handleBookmark}
        title={bookmarked ? "সংরক্ষিত" : "সংরক্ষণ করুন"}
        aria-label={bookmarked ? "সংরক্ষিত" : "সংরক্ষণ করুন"}
        className={`${buttonClassName} ${
          bookmarked ? "text-amber-400" : "text-white"
        }`}
      >
        <Bookmark className="w-4 h-4" />
      </button>
      <button
        onClick={handleShare}
        title="লিংক কপি করুন"
        aria-label="লিংক কপি করুন"
        className={buttonClassName}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

