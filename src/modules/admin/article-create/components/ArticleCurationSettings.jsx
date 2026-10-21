"use client";

import React from "react";
import { Sparkles, Flame, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ArticleCurationSettings({
  isBreaking,
  setIsBreaking,
  isLead,
  setIsLead,
  isHandpicked,
  setIsHandpicked,
}) {
  return (
    <Card className="border-slate-200 shadow-sm bg-slate-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          কিউরেশন ও বিশেষ ডিসপ্লে
        </CardTitle>
        <CardDescription className="text-xs">
          হোমপেজ ও টিকার সেকশনের স্থান নির্ধারণ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Breaking News Toggle */}
        <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">ব্রেকিং নিউজ</div>
              <div className="text-xs text-slate-500">হোমপেজের লাল টিকারে চলবে</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isBreaking}
            onChange={(e) => setIsBreaking(e.target.checked)}
            className="w-4 h-4 accent-red-600 cursor-pointer"
          />
        </label>

        {/* Lead Story Toggle */}
        <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">প্রধান সংবাদ (Lead)</div>
              <div className="text-xs text-slate-500">হোমপেজের প্রধান হিরো স্পটে</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isLead}
            onChange={(e) => setIsLead(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 cursor-pointer"
          />
        </label>

        {/* Handpicked Toggle */}
        <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">বাছাইকৃত (Handpicked)</div>
              <div className="text-xs text-slate-500">বাছাইকৃত সংবাদ সেকশনে থাকবে</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isHandpicked}
            onChange={(e) => setIsHandpicked(e.target.checked)}
            className="w-4 h-4 accent-amber-600 cursor-pointer"
          />
        </label>
      </CardContent>
    </Card>
  );
}

