"use client";

import React, { useState } from "react";
import {
  Search,
  Menu,
  X,
  Radio,
  Newspaper,
  Calendar,
  CloudSun,
  ChevronDown,
  Bell,
  TrendingUp,
} from "lucide-react";
import { FacebookIcon, YoutubeIcon, TwitterXIcon } from "./SocialIcons";
import { categories, banglaDate } from "../data/newsData";
import MobileDrawer from "./MobileDrawer";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* 1. TOP UTILITY BAR (Reference: Amar Desh & BD Pratidin top bar) */}
      <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-y-1">
          {/* Left: Date, Hijri, Weather */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>{banglaDate.day}, {banglaDate.date}</span>
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400 font-light">
              {banglaDate.banglaYear} • {banglaDate.hijriYear}
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span>{banglaDate.location} {banglaDate.weather}</span>
            </span>
          </div>

          {/* Right: Quick Services & Socials */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Live TV & Epaper buttons */}
            <a
              href="#live-tv"
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              লাইভ টিভি
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="#epaper"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <Newspaper className="w-3.5 h-3.5 text-slate-400" />
              ই-পেপার
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="#archive"
              className="hover:text-white transition-colors hidden xs:inline"
            >
              আর্কাইভ
            </a>

            {/* Social Icons */}
            <div className="hidden sm:flex items-center gap-2.5 text-slate-400 ml-1">
              <a href="https://facebook.com" aria-label="Facebook" className="hover:text-blue-400 transition-colors">
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a href="https://youtube.com" aria-label="YouTube" className="hover:text-red-500 transition-colors">
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
              <a href="https://twitter.com" aria-label="Twitter / X" className="hover:text-sky-400 transition-colors">
                <TwitterXIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BRAND LOGO & MASTHEAD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Central / Left Brand Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <a href="/" className="inline-flex flex-col items-center lg:items-start group">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Logo Icon Glyph */}
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="font-serif-bangla text-2xl sm:text-3xl font-black">খ</span>
                </div>
                {/* Brand Title */}
                <div>
                  <h1 className="font-serif-bangla text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-none group-hover:text-red-700 transition-colors">
                    দৈনিক খবর প্রবাহ
                  </h1>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500 tracking-wider mt-0.5 sm:mt-1">
                    সত্য ও সাহসের অগ্রদূত • THE LEADING NATIONAL BANGLA DAILY
                  </p>
                </div>
              </div>
            </a>
          </div>

          {/* Right Desktop Utilities & Banner */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Quick Live Alert Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span>২৪/৭ ব্রেকিং নিউজ আপডেট</span>
            </div>

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

            {/* Notification Bell */}
            <button
              title="বিজ্ঞপ্তি"
              className="p-2 rounded-full text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
            </button>
          </div>

          {/* Mobile Search Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
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

      {/* 3. CATEGORY & SUBCATEGORY MENU BAR (Desktop Sticky + Dropdowns) */}
      <nav className="sticky top-0 z-40 bg-red-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Category Links with Hover Subcategory Menus */}
            <div className="hidden lg:flex items-center divide-x divide-red-800/60 font-semibold text-sm">
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

            {/* Desktop Trending Quick Nav */}
            <div className="hidden lg:flex items-center gap-2 pl-4 text-xs font-semibold text-amber-200">
              <TrendingUp className="w-3.5 h-3.5" />
              <a href="#trending-section" className="hover:text-white transition-colors">
                জনপ্রিয়
              </a>
            </div>

            {/* Mobile Horizontal Swipeable Category Bar */}
            <div className="lg:hidden flex items-center overflow-x-auto scrollbar-none py-2.5 gap-2 -mx-2 px-2 text-xs font-medium text-white">
              <a
                href="#"
                className="px-3 py-1 rounded bg-red-900 text-white shrink-0 font-bold"
              >
                প্রচ্ছদ
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.slug}`}
                  className="px-2.5 py-1 rounded hover:bg-red-800 text-red-50 shrink-0 transition-colors whitespace-nowrap"
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

