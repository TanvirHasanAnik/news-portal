"use client";

import React from "react";
import { Clock, MapPin, TrendingUp, Flame, ArrowRight } from "lucide-react";
import NewsArticleCard from "./NewsArticleCard";
import { leadStory, secondaryLeads, trendingNews } from "../data/newsData";

export default function FeaturedHeroSection() {
  return (
    <section className="py-6 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Lead Story (Left Col: 7 columns on desktop) */}
          <div className="lg:col-span-7">
            <div className="relative group overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
              {/* Lead Image */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-900">
                <img
                  src={leadStory.image}
                  alt={leadStory.headline}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Lead Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="rounded bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                    {leadStory.category} • প্রধান খবর
                  </span>
                  <span className="rounded bg-amber-500/90 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-slate-950 shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-700" />
                    শীর্ষ সংবাদ
                  </span>
                </div>
              </div>

              {/* Lead Article Details */}
              <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                <div>
                  <h2 className="font-serif-bangla text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 leading-tight group-hover:text-red-700 transition-colors mb-3">
                    <a href={`#news-${leadStory.id}`}>
                      {leadStory.headline}
                    </a>
                  </h2>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4 font-normal">
                    {leadStory.summary}
                  </p>
                </div>

                {/* Lead Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800">{leadStory.author}</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {leadStory.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium text-slate-500">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span>{leadStory.publishedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Leads + Trending Sidebar (Right Col: 5 columns on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Secondary Lead News Stories */}
            <div className="flex flex-col gap-4">
              {secondaryLeads.map((item) => (
                <NewsArticleCard
                  key={item.id}
                  news={item}
                  variant="horizontal"
                />
              ))}
            </div>

            {/* Trending Quick Widget (সর্বাধিক পঠিত) */}
            <div id="trending-section" className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif-bangla">
                    সর্বাধিক পঠিত সংবাদ
                  </h3>
                </div>
                <span className="text-xs text-red-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                  সব দেখুন <ArrowRight className="w-3 h-3" />
                </span>
              </div>

              <div className="divide-y divide-slate-200/70">
                {trendingNews.slice(0, 3).map((item) => (
                  <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3 group">
                    <span className="font-black text-lg text-slate-300 group-hover:text-red-600 transition-colors w-5 shrink-0">
                      {item.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`#trending-${item.id}`}
                        className="font-serif-bangla text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug"
                      >
                        {item.headline}
                      </a>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="text-red-600 font-medium">{item.category}</span>
                        <span>•</span>
                        <span>{item.views}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

