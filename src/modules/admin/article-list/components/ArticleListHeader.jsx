import React from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArticleListHeader({ totalCount = 0 }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-900 text-white shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            সকল আর্টিকেল ও অনুমোদন
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          প্রকাশিত, খসড়া এবং অনুমোদনের অপেক্ষায় থাকা সংবাদ সম্পাদনা, অনুমোদন এবং আর্কাইভ ব্যবস্থাপনা।
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/admin?tab=create-article">
          <Button className="bg-red-600 hover:bg-red-700 text-white shadow-sm gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" />
            নতুন সংবাদ লিখুন
          </Button>
        </Link>
      </div>
    </div>
  );
}

