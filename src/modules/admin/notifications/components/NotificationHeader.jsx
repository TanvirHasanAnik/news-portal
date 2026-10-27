import React from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NotificationHeader({ unreadCount = 0 }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            নোটিফিকেশন
          </h1>
          {unreadCount > 0 && (
            <Badge className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5">
              {unreadCount.toLocaleString("bn-BD")}টি নতুন
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          আপনার জমা দেওয়া সংবাদ ও প্রশাসনিক আবেদনের অনুমোদন বা প্রত্যাখ্যান সংক্রান্ত হালনাগাদ তথ্য।
        </p>
      </div>
    </div>
  );
}

