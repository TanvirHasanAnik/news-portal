"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error("[Admin Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-lg text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            তথ্য লোড করতে সমস্যা হয়েছে
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            ডাটাবেজ সংযোগে সমস্যা হতে পারে অথবা সেশনটির মেয়াদ শেষ হয়ে থাকতে পারে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
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
            href="/admin/login"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            লগইন পেজে যান
          </Link>
        </div>
      </div>
    </div>
  );
}

