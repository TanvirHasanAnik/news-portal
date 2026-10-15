"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Menu,
  Home,
} from "lucide-react";
import { categories } from "../data/newsData";
import MobileDrawer from "./MobileDrawer";
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
                alt="আমাদের সংবাদ"
                className="h-9 sm:h-11 w-auto max-w-[220px] sm:max-w-[280px] object-contain"
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
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              {dates.english}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {dates.bangla}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {dates.hijri}
            </span>
          </div>

          {/* Center Column: Brand logo name slogan as a single image */}
          <div className="flex items-center justify-center">
            <a href="/" className="inline-block group focus:outline-none">
              <img
                src="/brand-logo.svg"
                alt="আমাদের সংবাদ - সত্য ও সাহসের অগ্রদূত"
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
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#1877F2] hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                title="Twitter"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <TwitterXIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                title="YouTube"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#FF0000] hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY MENU BAR (Desktop Only - Sticky, White & Centered) */}
      <nav className="hidden lg:block sticky top-0 z-40 bg-white border-y border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            {/* Centered Category Links with Home button */}
            <div className="flex items-center justify-center flex-wrap divide-x divide-slate-200 text-base font-bold">
              <a
                href="/"
                title="হোম পেজ"
                className="px-4.5 py-3.5 text-slate-800 hover:text-red-600 hover:bg-slate-50 transition-colors flex items-center gap-2 whitespace-nowrap tracking-wide"
              >
                <Home className="w-5 h-5 text-red-600 shrink-0" />
                <span>প্রচ্ছদ</span>
              </a>

              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.slug}`}
                  className="px-4.5 py-3.5 text-slate-700 hover:text-red-600 hover:bg-slate-50 transition-colors whitespace-nowrap tracking-wide"
                >
                  {cat.name}
                </a>
              ))}
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
