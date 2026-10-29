import React from "react";
import { FolderTree } from "lucide-react";

export function CategoryViewsBreakdown({ categoryStats = [] }) {
  const safeStats = Array.isArray(categoryStats) ? categoryStats : [];
  const maxViews = safeStats.reduce((max, c) => Math.max(max, c.total_views || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">

      <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900">ক্যাটাগরিভিত্তিক ট্রাফিক</h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          মোট {safeStats.length} টি বিভাগ
        </span>
      </div>


      <div className="divide-y divide-slate-100 mt-2 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar flex-1">
        {safeStats.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">এখনো কোনো ক্যাটাগরি ডেটা নেই</p>
        ) : (
          safeStats.map((cat) => {
            const views = cat.total_views || 0;

            const percentage = maxViews > 0 && views > 0 ? Math.min(100, Math.round((views / maxViews) * 100)) : 0;

            return (
              <div key={cat.category_slug} className="py-2.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">{cat.category_name}</span>
                  <div className="text-slate-500 flex items-center gap-2 font-mono">
                    <span>{cat.article_count || 0} টি সংবাদ</span>
                    <span>•</span>
                    <span className="font-bold text-slate-900">
                      {views.toLocaleString("bn-BD")} ভিউ
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      percentage > 0 ? "bg-slate-800" : "bg-transparent"
                    }`}
                    style={{ width: `${percentage}%` }}
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
