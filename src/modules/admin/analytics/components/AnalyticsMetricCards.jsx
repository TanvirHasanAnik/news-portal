import React from "react";
import { Eye, TrendingUp, Newspaper, Users } from "lucide-react";

export function AnalyticsMetricCards({ metrics }) {
  const cards = [
    {
      title: "মোট পৃষ্ঠা প্রদর্শন (Views)",
      value: (metrics.totalViews || 0).toLocaleString("bn-BD"),
      subtitle: "ডাটাবেজ থেকে আসল গণনা",
      icon: Eye,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "আজকের ভিজিট",
      value: (metrics.todayViews || 0).toLocaleString("bn-BD"),
      subtitle: "আজকের মোট পাঠ",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "সংবাদ সংখ্যা",
      value: (metrics.totalArticles || 0).toLocaleString("bn-BD"),
      subtitle: "ডাটাবেজে সংরক্ষিত",
      icon: Newspaper,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "ব্যবহারকারী / দল",
      value: (metrics.totalUsers || 0).toLocaleString("bn-BD"),
      subtitle: "সম্পাদকীয় সদস্য",
      icon: Users,
      color: "text-slate-700 bg-slate-100 border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 truncate">{card.title}</span>
              <div className={`p-1.5 rounded-lg border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
