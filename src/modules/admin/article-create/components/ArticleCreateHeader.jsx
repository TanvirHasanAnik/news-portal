import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ArticleCreateHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif-bangla">
            নতুন আর্টিকেল তৈরি করুন
          </h1>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
            Article Creation Module
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          সার্ভার অ্যাকশন এবং ক্লাউডফ্লেয়ার D1 (SQLite) রিপোজিটরির মাধ্যমে সরাসরি ডাটাবেজে সংবাদ যুক্ত করুন।
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="success" className="gap-1 py-1 px-3">
          <CheckCircle2 className="w-3.5 h-3.5" /> D1 Database Ready
        </Badge>
      </div>
    </div>
  );
}

