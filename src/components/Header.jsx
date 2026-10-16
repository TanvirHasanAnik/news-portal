"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  Home,
  ChevronDown,
} from "lucide-react";
import { categories } from "../data/newsData";
import MobileDrawer from "./MobileDrawer";
import NewsTickerSection from "./NewsTickerSection";
import {
  FacebookIcon,
  TwitterXIcon,
  YoutubeIcon,
  InstagramIcon,
} from "./SocialIcons";
import {
  getEnglishDateBangla,
  getBanglaDate,
  getHijriDate,
} from "../utils/dateUtils";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dates, setDates] = useState({
    english: "বৃহস্পতিবার, ১৫ অক্টোবর ২০২৬",
    bangla: "৩০ আশ্বিন ১৪৩৩ বঙ্গাব্দ",
    hijri: "৪ জমাদিউল আউয়াল ১৪৪৮ হিজরি",
  });

  // All categories for navigation (with Latest/সর্বশেষ first)
  const allNavCategories = [
    { id: "latest", name: "সর্বশেষ", slug: "latest" },
    ...categories.filter((c) => c.slug !== "latest"),
  ];

  // Overflow categories dropdown state
  const [visibleCount, setVisibleCount] = useState(allNavCategories.length);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const navContainerRef = useRef(null);
  const homeRef = useRef(null);
  const itemRefs = useRef([]);
  const itemWidthsRef = useRef([]);
  const moreDropdownRef = useRef(null);

  const visibleCategories = allNavCategories.slice(0, visibleCount);
  const overflowCategories = allNavCategories.slice(visibleCount);

  // Responsive calculation: if categories overflow header content cap, drop missed into right dropdown
  const calculateVisible = () => {
    if (!navContainerRef.current) return;
    const containerWidth = navContainerRef.current.clientWidth;
    if (!containerWidth) return;

    // Capture widths of items once
    if (itemRefs.current.length > 0 && itemWidthsRef.current.length < allNavCategories.length) {
      const measured = itemRefs.current.map((el) => (el ? el.getBoundingClientRect().width : 0));
      if (measured.length >= allNavCategories.length && measured.every((w) => w > 0)) {
        itemWidthsRef.current = measured;
      }
    }

    const widths = itemWidthsRef.current;
    if (!widths || widths.length === 0) return;

    const homeWidth = homeRef.current ? homeRef.current.getBoundingClientRect().width : 56;
    const moreBtnReserve = 96; // Space for "আরও ▾" button

    const totalNeeded = homeWidth + widths.reduce((sum, w) => sum + w, 0);

    if (totalNeeded <= containerWidth) {
      setVisibleCount(allNavCategories.length);
    } else {
      let available = containerWidth - homeWidth - moreBtnReserve;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        if (available - widths[i] < 0) {
          break;
        }
        available -= widths[i];
        count++;
      }
      setVisibleCount(Math.max(1, count));
    }
  };

  useEffect(() => {
    // Initial measurement
    calculateVisible();

    // Re-measure when fonts finish loading (Bangla font metric changes)
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        if (itemRefs.current.length >= allNavCategories.length) {
          itemWidthsRef.current = itemRefs.current.map((el) => (el ? el.getBoundingClientRect().width : 0));
        }
        calculateVisible();
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      calculateVisible();
    });

    if (navContainerRef.current) {
      resizeObserver.observe(navContainerRef.current);
    }

    window.addEventListener("resize", calculateVisible);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateVisible);
    };
  }, []);

  // Close "আরও" dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setMoreDropdownOpen(false);
      }
    };
    if (moreDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreDropdownOpen]);

  // Close "আরও" dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMoreDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setDates({
      english: getEnglishDateBangla(),
      bangla: getBanglaDate(),
      hijri: getHijriDate(),
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <>
      {/* 0. Top Horizontal Banner Ad Space (Exact height only: 50px mobile, 90px desktop - no padding or margin) */}
      <aside aria-label="বিজ্ঞাপন" className="w-full bg-slate-100 border-b border-slate-200 overflow-hidden">
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[728px] lg:max-w-[970px] h-[50px] sm:h-[90px] bg-slate-200/60 border-dashed border-2 border-slate-300 flex items-center justify-center text-slate-400 text-xs sm:text-sm font-medium">
            <span className="absolute top-1 left-2 text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none">
              বিজ্ঞাপন
            </span>
            <span className="hidden lg:inline">শীর্ষ ব্যানার বিজ্ঞাপন (৯৭০ × ৯০)</span>
            <span className="hidden sm:inline lg:hidden">শীর্ষ ব্যানার বিজ্ঞাপন (৭২৮ × ৯০)</span>
            <span className="inline sm:hidden">শীর্ষ ব্যানার বিজ্ঞাপন (৩২০ × ৫০)</span>
          </div>
        </div>
      </aside>

      <header className="w-full bg-white border-b border-slate-200">
      {/* 1. BRAND LOGO & MASTHEAD */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 lg:py-4">
        {/* Mobile Header Bar (< lg) */}
        <div className="flex lg:hidden items-center justify-between gap-2">
          {/* Mobile Hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 sm:p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 shrink-0"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Central Mobile Brand Logo Image */}
          <div className="flex-1 flex justify-center overflow-hidden px-2">
            <a href="/" className="inline-block">
              <img
                src="/brand-logo.svg"
                alt="আলো আসবে"
                className="h-10 sm:h-12 w-auto max-w-[240px] sm:max-w-[290px] object-contain"
              />
            </a>
          </div>

          {/* Mobile Search Toggle */}
          <div className="flex items-center shrink-0">
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
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="সংবাদ অনুসন্ধান করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>
          </div>
        )}

        {/* Desktop View Masthead (lg and above): 3 columns */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:items-center gap-4">
          {/* Left Column: English Date, Bangla Date, Hijri Date stacked vertically in bangla font */}
          <div className="flex flex-col items-start justify-center space-y-1 font-serif-bangla">
            <span className="text-lg font-medium text-slate-900 tracking-tight">
              {dates.english}
            </span>
            <span className="text-base font-medium text-slate-600">
              {dates.bangla}
            </span>
            <span className="text-base text-slate-600 font-medium">
              {dates.hijri}
            </span>
          </div>

          {/* Center Column: Brand logo name slogan as a single image */}
          <div className="flex items-center justify-center">
            <a href="/" className="inline-block group focus:outline-none">
              <img
                src="/brand-logo.svg"
                alt="আলো আসবে - সত্য ও সাহসের অগ্রদূত"
                className="h-14 xl:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </a>
          </div>

          {/* Right Column: Search bar and bottom of it social icons */}
          <div className="flex flex-col items-end justify-center gap-2.5">
            {/* Search Bar Input */}
            <form onSubmit={handleSearch} className="relative w-64 xl:w-72">
              <input
                type="text"
                placeholder="সংবাদ অনুসন্ধান করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all placeholder:text-slate-400 text-slate-800"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </form>

            {/* Social Media Link Icons directly below search bar */}
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
                className="w-7 h-7 rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] hover:scale-110 flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                title="Twitter"
                className="w-7 h-7 rounded-full bg-slate-900 text-white hover:bg-black hover:scale-110 flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <TwitterXIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                title="YouTube"
                className="w-7 h-7 rounded-full bg-[#FF0000] text-white hover:bg-[#e60000] hover:scale-110 flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90 hover:scale-110 flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

      {/* 2. CATEGORY MENU BAR (Sticky top-0 across page scroll on desktop) */}
      <nav className="hidden lg:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Category Bar with Dynamic Overflow "আরও" Dropdown */}
          <div ref={navContainerRef} className="flex items-center justify-center w-full min-w-0">
            {/* Centered Category Links with Home button - flex-nowrap prevents multi-line wrap */}
            <div className="flex items-center justify-center flex-nowrap divide-x divide-slate-200 text-base font-medium min-w-0">
              <a
                ref={homeRef}
                href="/"
                title="হোম পেজ"
                className="px-4.5 py-3.5 text-slate-800 hover:text-red-600 hover:bg-slate-50 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Home className="w-5 h-5 text-red-600 shrink-0" />
              </a>

              {/* Categories that fit inside the header content cap */}
              {visibleCategories.map((cat, idx) => (
                <a
                  key={cat.id}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  href={cat.slug === "latest" ? "#latest" : `#cat-${cat.slug}`}
                  className="px-4.5 py-3.5 text-xl text-slate-950 hover:text-red-600 hover:bg-slate-50 transition-colors whitespace-nowrap tracking-wide shrink-0"
                >
                  {cat.name}
                </a>
              ))}

              {/* Overflow Dropdown Button on the right for missed categories */}
              {overflowCategories.length > 0 && (
                <div className="relative shrink-0" ref={moreDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setMoreDropdownOpen((prev) => !prev)}
                    className={`px-4.5 py-3.5 text-xl font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap select-none cursor-pointer ${
                      moreDropdownOpen
                        ? "text-red-600 bg-red-50/70"
                        : "text-slate-950 hover:text-red-600 hover:bg-slate-50"
                    }`}
                    aria-expanded={moreDropdownOpen}
                    aria-label="আরও বিভাগ দেখুন"
                    title="আরও বিভাগ"
                  >
                    <span>আরও</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        moreDropdownOpen ? "rotate-180 text-red-600" : "text-slate-500"
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu of missed categories */}
                  {moreDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        অন্যান্য বিভাগ
                      </div>
                      <div className="py-1">
                        {overflowCategories.map((cat) => (
                          <a
                            key={cat.id}
                            href={cat.slug === "latest" ? "#latest" : `#cat-${cat.slug}`}
                            onClick={() => setMoreDropdownOpen(false)}
                            className="block px-4 py-2 text-base font-semibold text-slate-800 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            {cat.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 3. News Ticker Section (Breaking News & Headline Tickers) */}
      <NewsTickerSection />

      {/* Mobile Drawer Navigation Modal */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
