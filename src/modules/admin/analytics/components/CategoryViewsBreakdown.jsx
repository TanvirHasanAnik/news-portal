import React from "react";
import { FolderTree } from "lucide-react";

export function CategoryViewsBreakdown({ categoryStats }) {
  const maxViews = Math.max(...categoryStats.map((c) => c.total_views || 0), 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900">ক্যাটাগরিভিত্তিক ট্রাফিক</h2>
        </div>
        <span className="text-xs text-slate-400">সর্বমোট পাঠ সংখ্যা</span>
      </div>

      <div className="divide-y divide-slate-100 mt-2">
        {categoryStats.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">এখনো কোনো ক্যাটাগরি ডেটা নেই</p>
        ) : (
          categoryStats.slice(0, 6).map((cat) => {
            const percentage = Math.min(100, Math.round(((cat.total_views || 0) / maxViews) * 100));

            return (
              <div key={cat.category_slug} className="py-2.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">{cat.category_name}</span>
                  <div className="text-slate-500 flex items-center gap-2 font-mono">
                    <span>{cat.article_count} টি সংবাদ</span>
                    <span>•</span>
                    <span className="font-bold text-slate-900">
                      {(cat.total_views || 0).toLocaleString("bn-BD")} ভিউ
                    </span>
                  </div>
                </div>
                {/* Visual bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-slate-800 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

