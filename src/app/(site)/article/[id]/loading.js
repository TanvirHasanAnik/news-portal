import React from "react";

export default function ArticleDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">

        <div className="h-4 w-48 bg-slate-200 rounded-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-8 bg-white p-6 sm:p-8 border border-slate-200 space-y-6">

            <div className="h-5 w-24 bg-red-100 rounded-none" />

            <div className="space-y-3">
              <div className="h-8 bg-slate-300 rounded-none w-full" />
              <div className="h-8 bg-slate-300 rounded-none w-4/5" />
            </div>

            <div className="flex items-center gap-4 py-3 border-y border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-slate-300 rounded-none" />
                <div className="h-3 w-40 bg-slate-200 rounded-none" />
              </div>
            </div>

            <div className="aspect-[16/10] bg-slate-200 rounded-none w-full" />

            <div className="space-y-4 pt-2">
              <div className="h-4 bg-slate-200 rounded-none w-full" />
              <div className="h-4 bg-slate-200 rounded-none w-11/12" />
              <div className="h-4 bg-slate-200 rounded-none w-full" />
              <div className="h-4 bg-slate-200 rounded-none w-4/5" />
              <div className="h-4 bg-slate-200 rounded-none w-full" />
              <div className="h-4 bg-slate-200 rounded-none w-3/4" />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-200 aspect-[300/250] w-full rounded-none" />

            <div className="bg-white p-5 border border-slate-200 space-y-4">
              <div className="h-5 w-32 bg-slate-300 rounded-none" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 items-start pb-3 border-b border-slate-100 last:border-0">
                  <div className="w-6 h-6 rounded-none bg-slate-200 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-slate-300 rounded-none w-full" />
                    <div className="h-2.5 bg-slate-100 rounded-none w-2/3" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-200 aspect-[300/600] w-full hidden sm:block rounded-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
