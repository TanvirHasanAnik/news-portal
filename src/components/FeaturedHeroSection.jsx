"use client";

import React from "react";
import { Clock, MapPin, Flame, Megaphone, ExternalLink } from "lucide-react";
import { leadStory } from "../data/newsData";

export default function FeaturedHeroSection() {
  return (
    <section className="py-6 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Lead Story (Left Col: 7 columns on desktop) */}
          <div className="lg:col-span-7 flex flex-col">
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

          {/* Advertisement Space (Right Col: 5 columns on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="h-full min-h-[350px] lg:min-h-full rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-2xs hover:border-red-300 transition-colors">
              {/* Ad badge */}
              <span className="absolute top-3 right-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                বিজ্ঞাপন (ADVERTISEMENT)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
