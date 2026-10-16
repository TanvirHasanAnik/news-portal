"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { categories, banglaDate } from "../data/newsData";

export default function MobileDrawer({ isOpen, onClose }) {
  const pathname = usePathname();

  if (!isOpen) return null;

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
            <Link href="/" onClick={onClose} className="inline-block bg-white px-2.5 py-1.5 rounded-lg shadow-sm">
              <img
                src="/brand-logo.svg"
                alt="আলো আসবে"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-[11px] text-slate-400 mt-1.5">{banglaDate.date} • {banglaDate.banglaYear}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            প্রধান বিভাগসমূহ
          </div>

          <Link
            href="/"
            onClick={onClose}
            className={`block px-4 py-3 font-semibold transition-colors ${
              pathname === "/"
                ? "bg-red-50 text-red-600 font-bold"
                : "text-slate-800 hover:bg-red-50 hover:text-red-700"
            }`}
          >
            প্রচ্ছদ (হোম)
          </Link>

          {categories.map((cat) => {
            const isActive = pathname === `/category/${cat.slug}`;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={onClose}
                className={`block px-4 py-3 font-medium transition-colors ${
                  isActive
                    ? "bg-red-50 text-red-600 font-bold border-l-4 border-red-600 pl-3"
                    : "text-slate-800 hover:bg-slate-50 hover:text-red-600"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500">
          <p className="font-serif-bangla text-slate-700 font-medium">আলো আসবে অনলাইন সংস্করণ</p>
          <p className="text-[11px] text-slate-400 mt-0.5">কপিরাইট © ২০২৬ সর্ত্ব সংরক্ষিত</p>
        </div>
      </div>
    </div>
  );
}

