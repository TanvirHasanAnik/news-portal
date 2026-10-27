"use client";

import React from "react";
import Link from "next/link";
import { Clock, ExternalLink, Flame, Star, Sparkles, FileText, Edit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo, formatStaticDateTime } from "@/utils/dateUtils";

export default function RecentArticlesList({ articles = [], isLowerRole = false }) {
  if (articles.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-6 text-center text-slate-500 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-medium">এখনও কোনো আর্টিকেল তৈরি করা হয়নি।</p>
          <p className="text-xs text-slate-400">
            {isLowerRole
              ? "উপরের ফর্মটি পূরণ করে খসড়া সংরক্ষণ করুন বা পর্যালোচনার জন্য জমা দিন।"
              : "উপরের ফর্মটি পূরণ করে প্রথম আর্টিকেলটি প্রকাশ করুন।"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              {isLowerRole ? "আপনার সাম্প্রতিক আর্টিকেলসমূহ" : "ডাটাবেজে সংরক্ষিত সাম্প্রতিক আর্টিকেল"}
            </CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {articles.length} টি
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-slate-100">
        {articles.map((art) => {
          const isPublished = art.status === "published";
          const isPending = art.status === "pending" || art.status === "pending_approval";
          const isRejected = art.status === "rejected";
          const isDraft = art.status === "draft";

          return (
            <div
              key={art.id}
              className="p-4 hover:bg-slate-50/70 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={`text-[11px] ${
                        isPublished
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isPending
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : isRejected
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {isPublished
                        ? "প্রকাশিত"
                        : isPending
                        ? "পর্যালোচনার অপেক্ষায়"
                        : isRejected
                        ? "প্রত্যাখ্যাত"
                        : "খসড়া"}
                    </Badge>

                    <Badge variant="outline" className="text-[11px] bg-slate-50">
                      {art.category_name || art.category_slug}
                    </Badge>

                    {art.subcategory_name && (
                      <span className="text-xs text-slate-500">
                        / {art.subcategory_name}
                      </span>
                    )}

                    {art.is_breaking === 1 && (
                      <Badge variant="destructive" className="text-[10px] gap-1 px-1.5">
                        <Flame className="w-3 h-3" /> ব্রেকিং
                      </Badge>
                    )}

                    {art.is_lead === 1 && (
                      <Badge className="bg-indigo-600 text-white text-[10px] gap-1 px-1.5">
                        <Star className="w-3 h-3" /> লিড
                      </Badge>
                    )}

                    {art.is_handpicked === 1 && (
                      <Badge className="bg-amber-600 text-white text-[10px] gap-1 px-1.5">
                        <Sparkles className="w-3 h-3" /> বাছাইকৃত
                      </Badge>
                    )}
                  </div>

                  <Link
                    href={`/admin?tab=create-article&editId=${art.id}`}
                    className="block font-serif-bangla text-base font-bold text-slate-900 leading-snug hover:text-blue-600 transition-colors line-clamp-1"
                  >
                    {art.headline}
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>
                      তৈরি: @{art.created_by || "reporter"} ({formatStaticDateTime(art.created_at)})
                    </span>
                    {art.last_edited_by && (
                      <span>
                        • সম্পাদনা: @{art.last_edited_by} ({formatStaticDateTime(art.last_edited_at || art.updated_at || art.created_at)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/admin?tab=create-article&editId=${art.id}`}
                    title="সম্পাদনা করুন"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  {isPublished && (
                    <Link
                      href={`/article/${art.slug || art.id}`}
                      target="_blank"
                      title="সাইটে দেখুন"
                      className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}