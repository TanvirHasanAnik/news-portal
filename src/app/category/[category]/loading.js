import React from "react";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-40 bg-slate-200 rounded-sm" />

        {/* Category Header Skeleton */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="h-10 w-48 bg-slate-300 rounded-md" />
            <div className="h-4 w-72 bg-slate-200 rounded-sm" />
          </div>
          <div className="h-8 w-28 bg-slate-200 rounded-full" />
        </div>

        {/* Subcategories Pills Skeleton */}
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-7 w-20 bg-slate-200 rounded-full" />
          ))}
        </div>

        {/* Lead Story Skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-[16/10] bg-slate-200 rounded-lg w-full" />
          <div className="space-y-4 justify-center flex flex-col">
            <div className="h-4 w-24 bg-red-100 rounded-sm" />
            <div className="h-8 w-full bg-slate-300 rounded-md" />
            <div className="h-4 w-5/6 bg-slate-200 rounded-sm" />
            <div className="h-4 w-4/6 bg-slate-200 rounded-sm" />
            <div className="h-3 w-32 bg-slate-200 rounded-sm pt-2" />
          </div>
        </div>

        {/* Grid Stories Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="aspect-[16/10] bg-slate-200 rounded-lg w-full" />
              <div className="h-5 w-full bg-slate-300 rounded-md" />
              <div className="h-4 w-3/4 bg-slate-200 rounded-sm" />
              <div className="h-3 w-28 bg-slate-100 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

