import React from "react";
import { Share2 } from "lucide-react";

export function SocialLinksHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            সামাজিক যোগাযোগ মাধ্যম লিংক
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          ওয়েবসাইটের হেডার ও ফুটারে প্রদর্শিত সামাজিক যোগাযোগ মাধ্যমের পেজ ও চ্যানেলের লিংক নির্ধারণ করুন।
        </p>
      </div>
    </div>
  );
}

