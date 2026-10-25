import React from "react";
import { Users } from "lucide-react";

export function UserHeader({ userCount = 0 }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-700 text-white shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ব্যবহারকারী ও ভূমিকা ব্যবস্থাপনা
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          সম্পাদকীয় দলের সদস্য তালিকা, নতুন সদস্য তৈরি, পদবী ও প্রবেশাধিকার নিয়ন্ত্রণ।
        </p>
      </div>

      <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white self-start sm:self-auto">
        মোট সদস্য: {userCount.toLocaleString("bn-BD")} জন
      </div>
    </div>
  );
}
