"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiteError({ error, reset }) {
  useEffect(() => {
    console.error("[Site Route Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-lg text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            পৃষ্ঠাটি লোড করতে সমস্যা হয়েছে
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            ডাটাবেজ বা সার্ভার সংযোগে সাময়িক সমস্যা দেখা দিয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            পুনরায় চেষ্টা করুন
          </Button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            হোমপেজে যান
          </Link>
        </div>
      </div>
    </div>
  );
}

