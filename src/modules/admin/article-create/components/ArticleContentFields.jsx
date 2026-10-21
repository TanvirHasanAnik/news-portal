"use client";

import React from "react";
import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import RichTextEditor from "./RichTextEditor";

export default function ArticleContentFields({
  headline,
  setHeadline,
  summary,
  setSummary,
  content,
  setContent,
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5 text-red-600" />
              সংবাদের মূল বিবরণ
            </CardTitle>
            <CardDescription>
              নিবন্ধের শিরোনাম, সারাংশ এবং পূর্ণাঙ্গ সংবাদ লিখুন
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Headline */}
        <div className="space-y-1.5">
          <Label htmlFor="headline" className="text-sm font-semibold text-slate-800">
            সংবাদের শিরোনাম <span className="text-red-500">*</span>
          </Label>
          <Input
            id="headline"
            placeholder="মূল শিরোনাম এখানে লিখুন"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="font-serif-bangla text-lg font-medium"
            required
          />
        </div>

        {/* Summary / Lead */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="summary" className="text-sm font-semibold text-slate-800">
              সংক্ষিপ্ত ভূমিকা / সারাংশ
            </Label>
            <span className="text-xs text-slate-400">কার্ডে ও সোশ্যাল শেয়ারে প্রদর্শিত হবে</span>
          </div>
          <Textarea
            id="summary"
            rows={2}
            placeholder="সংবাদের মূল বার্তা বা হাইলাইট এখানে সংক্ষেপে তুলে ধরুন"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="font-serif-bangla text-sm"
          />
        </div>

        {/* Detailed Article Body (Custom WYSIWYG Editor) */}
        <div className="space-y-1.5">
          <Label htmlFor="content-editor" className="text-sm font-semibold text-slate-800">
            বিস্তারিত সংবাদ <span className="text-red-500">*</span>
          </Label>
          <RichTextEditor
            value={content}
            onChange={(jsonString) => setContent(jsonString)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

