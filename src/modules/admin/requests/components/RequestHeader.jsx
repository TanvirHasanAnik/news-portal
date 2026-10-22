import React from "react";
import { ClipboardList } from "lucide-react";

export function RequestHeader({ pendingCount = 0 }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            অ্যাডমিন আবেদন ও অনুমোদন (Admin Requests)
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          অ্যাডমিন কর্তৃক প্রেরিত নতুন ব্যবহারকারী, রোল পরিবর্তন ও কিউরেশন সংক্রান্ত অনুরোধ পর্যালোচনা।
        </p>
      </div>

      <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        অপেক্ষমান আবেদন: {pendingCount.toLocaleString("bn-BD")} টি
      </div>
    </div>
  );
}

