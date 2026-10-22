import React from "react";
import { Sparkles } from "lucide-react";

export function CurationHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            সংবাদ কিউরেশন (বাছাইকৃত ও জরুরি সংবাদ)
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          মূল ওয়েবসাইটের হোমপেজে প্রদর্শিত বাছাইকৃত সংবাদ এবং জরুরি ব্রেকিং নিউজ পরিচালনা করুন।
        </p>
      </div>

      <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white self-start sm:self-auto">
        প্রধান সম্পাদকীয় নিয়ন্ত্রণ
      </div>
    </div>
  );
}

