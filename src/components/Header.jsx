"use client";

import React, { useState } from "react";
import {
  Search,
  Menu,
  ChevronDown,
  Bell,
  TrendingUp,
} from "lucide-react";
import { categories } from "../data/newsData";
import MobileDrawer from "./MobileDrawer";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* 1. BRAND LOGO & MASTHEAD */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Mobile Hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 shrink-0"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Central / Left Brand Logo */}
          <div className="flex-1 lg:flex-none flex justify-center lg:justify-start overflow-hidden">
            <a href="/" className="inline-flex items-center gap-2 sm:gap-3 group text-left">
              {/* Logo Icon Glyph */}
              <div className="h-9 w-9 sm:h-12 sm:w-12 shrink-0 rounded-lg bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="font-serif-bangla text-xl sm:text-3xl font-black">খ</span>
              </div>
              {/* Brand Title & Tagline */}
              <div className="text-left min-w-0">
                <h1 className="font-serif-bangla text-xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-none group-hover:text-red-700 transition-colors whitespace-nowrap">
                  আমাদের সংবাদ
                </h1>
                <p className="text-[8px] min-[380px]:text-[9px] sm:text-xs font-medium text-slate-500 tracking-wider mt-0.5 sm:mt-1 whitespace-nowrap">
                  সত্য ও সাহসের অগ্রদূত • THE LEADING NATIONAL BANGLA DAILY
                </p>
              </div>
            </a>
          </div>

          {/* Right Desktop Utilities */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search Bar Input */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="সংবাদ অনুসন্ধান করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Mobile Search Toggle */}
          <div className="lg:hidden flex items-center shrink-0">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="অনুসন্ধান"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown Bar */}
        {searchOpen && (
          <div className="mt-3 lg:hidden p-2 bg-slate-100 rounded-lg border border-slate-200">
            <div className="relative">
              <input
                type="text"
                placeholder="সংবাদ অনুসন্ধান করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        )}
      </div>

      {/* 2. CATEGORY & SUBCATEGORY MENU BAR (Desktop Only - Sticky + Dropdowns) */}
      <nav className="hidden lg:block sticky top-0 z-40 bg-red-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Category Links with Hover Subcategory Menus */}
            <div className="flex items-center divide-x divide-red-800/60 font-semibold text-sm">
              <a
                href="#"
                className="px-3.5 py-3 hover:bg-red-800 transition-colors flex items-center gap-1"
              >
                প্রচ্ছদ
              </a>

              {categories.map((cat) => {
                const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                return (
                  <div
                    key={cat.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <a
                      href={`#cat-${cat.slug}`}
                      className="px-3.5 py-3 hover:bg-red-800 transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                      {cat.name}
                      {hasSubs && (
                        <ChevronDown className="w-3.5 h-3.5 text-red-200 group-hover:rotate-180 transition-transform duration-200" />
                      )}
                    </a>

                    {/* Subcategories Dropdown Panel */}
                    {hasSubs && (
                      <div className="absolute top-full left-0 w-52 bg-white text-slate-800 shadow-xl rounded-b-lg border-t-2 border-red-600 border-x border-b border-slate-200 py-2 hidden group-hover:block transition-all duration-200 z-50">
                        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                          {cat.name} উপবিভাগ
                        </div>
                        {cat.subcategories.map((sub, idx) => (
                          <a
                            key={idx}
                            href={`#cat-${cat.slug}`}
                            className="block px-3.5 py-1.5 text-xs text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
                          >
                            {sub}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Modal */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}
