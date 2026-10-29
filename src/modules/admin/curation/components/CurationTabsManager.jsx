"use client";

import React, { useState } from "react";
import { BookmarkCheck, Zap } from "lucide-react";
import { HandpickedCurationTab } from "./HandpickedCurationTab";
import { BreakingCurationTab } from "./BreakingCurationTab";

export function CurationTabsManager({ initialItems = [], articles = [] }) {
  const [activeTab, setActiveTab] = useState("handpicked"); 

  const handpickedItems = initialItems.filter((item) => item.type === "handpicked");
  const breakingItems = initialItems.filter((item) => item.type === "breaking");

  return (
    <div className="space-y-6">

      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("handpicked")}
          className={`flex items-center gap-2 pb-3 px-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "handpicked"
              ? "border-amber-500 text-amber-600 bg-amber-50/40 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>বাছাইকৃত খবর (Handpicked)</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {handpickedItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("breaking")}
          className={`flex items-center gap-2 pb-3 px-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "breaking"
              ? "border-red-600 text-red-600 bg-red-50/40 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>জরুরি ব্রেকিং সংবাদ (Breaking)</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {breakingItems.length}
          </span>
        </button>
      </div>


      {activeTab === "handpicked" ? (
        <HandpickedCurationTab
          initialItems={handpickedItems}
          articles={articles}
        />
      ) : (
        <BreakingCurationTab
          initialItems={breakingItems}
          articles={articles}
        />
      )}
    </div>
  );
}
