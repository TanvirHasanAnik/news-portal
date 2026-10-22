import React from "react";
import Link from "next/link";
import { Flame, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TopArticlesTable({ articles = [] }) {
  // Always display top 10 items
  const displayArticles = articles.slice(0, 10);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">সর্বাধিক পঠিত সংবাদ</h2>
        </div>
      </div>

      {/* Scrollable container with consistent component space */}
      <div className="divide-y divide-slate-100 mt-2 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar flex-1">
        {displayArticles.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center">কোনো প্রকাশিত সংবাদ পাওয়া যায়নি।</p>
        ) : (
          displayArticles.map((art, idx) => (
            <div key={art.id || idx} className="py-2.5 flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-center text-xs font-bold text-slate-400 font-mono">
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/article/${art.slug || art.id}`}
                    target="_blank"
                    className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1 flex items-center gap-1.5"
                  >
                    <span>{art.headline}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {art.category_name || art.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                  {(art.view_count || 0).toLocaleString("bn-BD")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
