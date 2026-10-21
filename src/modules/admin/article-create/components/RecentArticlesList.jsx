import React from "react";
import Link from "next/link";
import { Clock, ExternalLink, Flame, Star, Sparkles, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecentArticlesList({ articles = [] }) {
  if (articles.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-6 text-center text-slate-500 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-medium">এখনও কোনো আর্টিকেল তৈরি করা হয়নি।</p>
          <p className="text-xs text-slate-400">
            বামপাশের ফর্মটি পূরণ করে প্রথম আর্টিকেলটি প্রকাশ করুন।
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
              ডাটাবেজে সংরক্ষিত সাম্প্রতিক আর্টিকেল
            </CardTitle>
            <CardDescription className="text-xs">
              SQLite / D1 রিপোজিটরির লাইভ ডাটা
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {articles.length} টি
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-slate-100">
        {articles.map((art) => {
          const isPublished = art.status === "published";

          return (
            <div
              key={art.id}
              className="p-4 hover:bg-slate-50/70 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={isPublished ? "success" : "secondary"}
                      className="text-[11px]"
                    >
                      {isPublished
                        ? "প্রকাশিত"
                        : art.status === "draft"
                        ? "খসড়া"
                        : "পর্যালোচনার অপেক্ষায়"}
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

                  <h4 className="font-serif-bangla text-base font-bold text-slate-900 leading-snug hover:text-red-600 transition-colors">
                    {art.headline}
                  </h4>
                </div>

                <Link
                  href={`/article/${art.slug || art.id}`}
                  target="_blank"
                  title="সাইটে দেখুন"
                  className="shrink-0 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {art.summary && (
                <p className="text-xs text-slate-600 line-clamp-2 font-serif-bangla leading-relaxed">
                  {art.summary}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {art.created_at ? new Date(art.created_at).toLocaleString("bn-BD") : "এখনই"}
                </span>
                <span>প্রতিবেদক: {art.author_name || "নিজস্ব প্রতিবেদক"}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

