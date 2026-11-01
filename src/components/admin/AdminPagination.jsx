"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export function AdminPagination({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 20,
  pageParamName = "page",
  onPageChange,
  className = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const safePage = Math.max(1, Number(currentPage) || 1);
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);

  const toBn = (num) => Number(num).toLocaleString("bn-BD");

  const goToPage = (page) => {
    if (page < 1 || page > safeTotalPages || page === safePage) return;
    if (onPageChange) {
      onPageChange(page);
    } else {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
      params.set(pageParamName, String(page));
      router.push(`?${params.toString()}`);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (safeTotalPages <= 7) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (safePage > 3) {
        pages.push("ellipsis-1");
      }

      const start = Math.max(2, safePage - 1);
      const end = Math.min(safeTotalPages - 1, safePage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (safePage < safeTotalPages - 2) {
        pages.push("ellipsis-2");
      }
      pages.push(safeTotalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex items-center justify-center gap-1.5 px-4 py-3 bg-white border-t border-slate-200 text-xs text-slate-600 ${className}`}
    >
      <button
        type="button"
        onClick={() => goToPage(safePage - 1)}
        disabled={safePage <= 1}
        aria-label="পূর্ববর্তী পৃষ্ঠা"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">পূর্ববর্তী</span>
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((p, idx) => {
          if (typeof p === "string" && p.startsWith("ellipsis")) {
            return (
              <span
                key={`${p}-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-slate-400"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </span>
            );
          }

          const isCurrent = p === safePage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              aria-current={isCurrent ? "page" : undefined}
              className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-md font-semibold transition-all ${
                isCurrent
                  ? "bg-slate-900 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {toBn(p)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => goToPage(safePage + 1)}
        disabled={safePage >= safeTotalPages}
        aria-label="পরবর্তী পৃষ্ঠা"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className="hidden sm:inline">পরবর্তী</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
