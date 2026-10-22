import React from "react";
import { BarChart3 } from "lucide-react";

export function AnalyticsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-900 text-white shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            অ্যানালিটিক্স ও অডিট ড্যাশবোর্ড
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          পাঠক সংখ্যা, সর্বাধিক পঠিত সংবাদ, বিভাগভিত্তিক ট্রাফিক এবং প্রশাসনিক অডিট লগ।
        </p>
      </div>
    </div>
  );
}

