import React from "react";
import { FolderTree } from "lucide-react";

export function CategoryHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-sm">
            <FolderTree className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ক্যাটাগরি ও সাব-ক্যাটাগরি ব্যবস্থাপনা
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          সংবাদ ক্যাটাগরি, উপ-বিভাগ এবং মেনুর সাজসজ্জা পরিচালনা করুন।
        </p>
      </div>

      <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 self-start sm:self-auto">
        সুপার অ্যাডমিন ফিচার
      </div>
    </div>
  );
}

