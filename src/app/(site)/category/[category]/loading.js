import React from "react";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">

        <div className="h-4 w-40 bg-slate-200 rounded-sm" />


        <div className="border-b border-slate-200 pb-6 flex items-center justify-between gap-4">
          <div className="h-10 w-44 bg-slate-300 rounded-md" />
          <div className="h-6 w-6 bg-slate-200 rounded-full sm:hidden" />
        </div>


        <div className="hidden sm:flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-7 w-20 bg-slate-200 rounded-none" />
          ))}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-8 space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-slate-200">
              <div className="md:col-span-7 aspect-[16/10] bg-slate-200 rounded-none w-full" />
              <div className="md:col-span-5 space-y-4">
                <div className="h-8 w-full bg-slate-300 rounded-none" />
                <div className="h-4 w-5/6 bg-slate-200 rounded-none" />
                <div className="h-4 w-4/6 bg-slate-200 rounded-none" />
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[16/10] bg-slate-200 rounded-none w-full" />
                  <div className="h-5 w-full bg-slate-300 rounded-none" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded-none" />
                </div>
              ))}
            </div>
          </div>


          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-200 aspect-[300/250] max-w-[320px] mx-auto rounded-none" />
            <div className="bg-slate-200 aspect-[300/600] max-w-[320px] mx-auto hidden sm:block rounded-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

