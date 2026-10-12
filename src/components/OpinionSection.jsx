"use client";

import React from "react";
import { Feather, ArrowRight, Quote } from "lucide-react";
import { opinionArticles } from "../data/newsData";

export default function OpinionSection() {
  return (
    <section className="py-8 bg-slate-100/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-red-600" />
            <h2 className="font-serif-bangla text-2xl font-bold text-slate-900">
              মতামত ও সম্পাদকীয়
            </h2>
          </div>
          <a
            href="#all-opinion"
            className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 group"
          >
            সব কলাম দেখুন
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {opinionArticles.map((op) => (
            <div
              key={op.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow relative flex flex-col justify-between group"
            >
              <div>
                <Quote className="w-7 h-7 text-slate-200 group-hover:text-red-200 transition-colors mb-2" />
                <h3 className="font-serif-bangla text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-3 mb-4">
                  <a href={`#opinion-${op.id}`}>{op.title}</a>
                </h3>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={op.avatar}
                  alt={op.author}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-red-100"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{op.author}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{op.designation}</p>
                  <span className="text-[11px] font-medium text-red-600">{op.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

