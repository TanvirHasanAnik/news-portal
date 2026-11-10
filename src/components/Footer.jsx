"use client";

import { ArrowUp, MapPin } from "lucide-react";
import Link from "next/link";
import SocialMediaLinks from "./SocialMediaLinks";

export default function Footer({ socialLinks = {} }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white text-slate-600 pt-8 pb-8 border-t-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <Link href="/" className="inline-block group focus:outline-none">
            <img
              src="/brand-logo.svg"
              alt="আলো আসবে - সত্য ও সাহসের অগ্রদূত"
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          <div className="flex items-center gap-4 flex-wrap">
            <SocialMediaLinks links={socialLinks} variant="footer" />

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-red-600 text-slate-700 hover:text-white text-xs font-semibold transition-colors border border-slate-200 shadow-xs ml-auto sm:ml-0 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
              <span>উপরে যান</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <p>
                <strong className="text-slate-800">পরিচালক:</strong> মো: ফুয়াদ হাসান
              </p>
              <p>
                <strong className="text-slate-800">প্রকাশক:</strong> মোঃ তৌহিদুল ইসলাম
              </p>
            </div>
            <p className="flex items-start sm:items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong className="text-slate-800">সম্পাদকীয় ও বাণিজ্য বিভাগ:</strong> 165/1/A (1st floor), East kafrul, Dhaka cant, Dhaka-1206
              </span>
            </p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          <p>© ২০২৬ আলো আসবে। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
}
