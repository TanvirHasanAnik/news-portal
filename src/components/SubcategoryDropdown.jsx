"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Check } from "lucide-react";

export default function SubcategoryDropdown({
  slug,
  subcategories = [],
  selectedSub = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="উপ-বিভাগ নির্বাচন করুন"
        className="p-1 rounded-full text-slate-600 hover:text-red-600 hover:bg-slate-100/70 transition-colors cursor-pointer select-none focus:outline-none flex items-center justify-center"
      >
        <ChevronDown
          className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 shrink-0 ${
            isOpen
              ? "rotate-180 text-red-600"
              : selectedSub
              ? "text-red-600"
              : "text-slate-700"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 sm:w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            উপ-বিভাগ নির্বাচন
          </div>

          <div className="py-1 max-h-64 overflow-y-auto">

            <Link
              href={`/category/${slug}`}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2 text-sm font-serif-bangla font-semibold transition-colors hover:bg-slate-50 ${
                !selectedSub
                  ? "text-red-600 font-bold"
                  : "text-slate-800 hover:text-red-600"
              }`}
            >
              <span>সকল</span>
              {!selectedSub && <Check className="w-4 h-4 text-red-600 shrink-0" />}
            </Link>

            {subcategories.map((sub, index) => {
              const isSelected = selectedSub === sub;
              return (
                <Link
                  key={index}
                  href={`/category/${slug}?sub=${encodeURIComponent(sub)}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2 text-sm font-serif-bangla font-semibold transition-colors hover:bg-slate-50 ${
                    isSelected
                      ? "text-red-600 font-bold"
                      : "text-slate-800 hover:text-red-600"
                  }`}
                >
                  <span>{sub}</span>
                  {isSelected && <Check className="w-4 h-4 text-red-600 shrink-0" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

