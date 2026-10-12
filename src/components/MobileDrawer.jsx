"use client";

import React, { useState } from "react";
import { X, ChevronDown, ChevronRight, Search, Newspaper, Radio, Flame, Sparkles } from "lucide-react";
import { categories, banglaDate } from "../data/newsData";

export default function MobileDrawer({ isOpen, onClose }) {
  const [openCategory, setOpenCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const toggleSubcategory = (catId) => {
    setOpenCategory(openCategory === catId ? null : catId);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-in Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col z-10 transform transition-transform duration-300 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="font-serif-bangla text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span className="h-6 w-6 rounded bg-red-600 flex items-center justify-center text-xs font-black">খ</span>
              দৈনিক খবর প্রবাহ
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">{banglaDate.date} • {banglaDate.banglaYear}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search in Drawer */}
        <div className="p-3 bg-slate-100 border-b border-slate-200">
          <div className="relative">
            <input
              type="text"
              placeholder="সংবাদ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="p-3 grid grid-cols-2 gap-2 bg-slate-50 border-b border-slate-200 text-xs font-medium">
          <a
            href="#live-tv"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-600 text-white shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            লাইভ টিভি
          </a>
          <a
            href="#epaper"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 text-white shadow-xs"
          >
            <Newspaper className="w-3.5 h-3.5" />
            ই-পেপার
          </a>
        </div>

        {/* Navigation Categories List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            প্রধান বিভাগ ও উপবিভাগ
          </div>

          <a
            href="#"
            onClick={onClose}
            className="block px-4 py-3 text-slate-800 font-semibold hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            প্রচ্ছদ (হোম)
          </a>

          {categories.map((cat) => {
            const isSubOpen = openCategory === cat.id;
            return (
              <div key={cat.id} className="transition-colors">
                <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                  <a
                    href={`#cat-${cat.slug}`}
                    onClick={onClose}
                    className="font-medium text-slate-800 hover:text-red-600 transition-colors flex-1"
                  >
                    {cat.name}
                  </a>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <button
                      onClick={() => toggleSubcategory(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors"
                      aria-label={`${cat.name} এর উপবিভাগ`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isSubOpen ? "rotate-180 text-red-600" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategory Accordion */}
                {isSubOpen && cat.subcategories && (
                  <div className="bg-slate-50/80 px-4 py-2 border-l-2 border-red-600 ml-4 mb-2 space-y-1.5 rounded-r">
                    {cat.subcategories.map((sub, idx) => (
                      <a
                        key={idx}
                        href={`#${cat.slug}-${sub}`}
                        onClick={onClose}
                        className="flex items-center gap-1.5 py-1 text-xs text-slate-600 hover:text-red-600 transition-colors font-normal"
                      >
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        {sub}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500">
          <p className="font-serif-bangla text-slate-700 font-medium">দৈনিক খবর প্রবাহ অনলাইন সংস্করণ</p>
          <p className="text-[11px] text-slate-400 mt-0.5">কপিরাইট © ২০২৬ সর্ত্ব সংরক্ষিত</p>
        </div>
      </div>
    </div>
  );
}

