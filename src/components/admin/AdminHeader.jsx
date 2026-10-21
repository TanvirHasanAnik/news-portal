"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";

export default function AdminHeader({ onMenuToggle }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle + Branding with Main Logo SVG */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Hamburger toggle (visible below md screen) */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 shrink-0 cursor-pointer transition-colors"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin" className="flex items-center gap-2.5 group focus:outline-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo.svg"
              alt="আমাদের সংবাদ"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200 select-none hidden sm:inline-block">
              অ্যাডমিন প্যানেল
            </span>
          </Link>
        </div>

        {/* Right: Quick link to live public site */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            লাইভ সাইট <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
