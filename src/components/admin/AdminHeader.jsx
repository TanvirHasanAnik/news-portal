import React from "react";
import Link from "next/link";
import { Newspaper, Database, ExternalLink, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Branding & Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-serif-bangla font-black text-xl shadow-sm transition-transform group-hover:scale-105">
              আ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-bangla text-lg font-bold text-slate-950">
                  আলো আসবে
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-medium">
                  CMS Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                সার্ভার ড্রিভেন কন্টেন্ট ম্যানেজমেন্ট সিস্টেম
              </p>
            </div>
          </Link>
        </div>

        {/* Right: DB Engine status & Quick links */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">Cloudflare D1 (SQLite)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <Badge variant="outline" className="hidden sm:inline-flex bg-amber-50 text-amber-800 border-amber-200 gap-1 font-normal">
            <ShieldAlert className="w-3 h-3 text-amber-600" /> ডেমো ফেজ (অথেনটিকেশন মুক্ত)
          </Badge>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            লাইভ সাইট <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

