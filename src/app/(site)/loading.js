import React from "react";

export default function SiteLoading() {
  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-pulse">

        <div className="h-10 bg-slate-200 rounded-none w-full" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start bg-white p-6 border border-slate-200">

          <div className="lg:col-span-1 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2 pb-4 border-b border-slate-100 last:border-0">
                <div className="h-4 bg-slate-200 rounded-none w-3/4" />
                <div className="h-3 bg-slate-100 rounded-none w-1/2" />
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[16/10] bg-slate-200 rounded-none w-full" />
            <div className="space-y-3">
              <div className="h-7 bg-slate-300 rounded-none w-5/6" />
              <div className="h-4 bg-slate-200 rounded-none w-full" />
              <div className="h-4 bg-slate-200 rounded-none w-4/5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[16/10] bg-slate-200 rounded-none w-full" />
                  <div className="h-4 bg-slate-300 rounded-none w-4/5" />
                  <div className="h-3 bg-slate-100 rounded-none w-2/3" />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-200 aspect-[300/250] w-full rounded-none" />
            <div className="space-y-3">
              <div className="h-5 bg-slate-300 rounded-none w-1/3" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5 pb-2 border-b border-slate-100 last:border-0">
                  <div className="h-3.5 bg-slate-200 rounded-none w-full" />
                  <div className="h-2.5 bg-slate-100 rounded-none w-1/3" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200 space-y-6">
          <div className="h-6 bg-slate-300 rounded-none w-36" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[16/10] bg-slate-200 rounded-none w-full" />
                <div className="h-5 bg-slate-300 rounded-none w-4/5" />
                <div className="h-3.5 bg-slate-100 rounded-none w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
