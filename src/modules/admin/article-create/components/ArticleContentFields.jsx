"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { FileText, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import RichTextEditor from "./RichTextEditor";

export default function ArticleContentFields({
  register,
  control,
  errors = {},
  // Fallbacks for backward compatibility
  headline = "",
  setHeadline,
  summary = "",
  setSummary,
  content = "",
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* 1. Headline Field (Mandatory - Pure Bangla Only) */}
        <div className="space-y-1.5">
          <Label htmlFor="headline" className="text-sm font-semibold text-slate-800">
            সংবাদের শিরোনাম <span className="text-red-500">*</span>
          </Label>

          {register ? (
            <Input
              id="headline"
              placeholder="মূল শিরোনাম এখানে লিখুন"
              {...register("headline")}
              className={`font-serif-bangla text-lg font-medium transition-colors ${
                errors?.headline ? "border-red-500 focus:border-red-600 ring-1 ring-red-500/20" : ""
              }`}
            />
          ) : (
            <Input
              id="headline"
              placeholder="মূল শিরোনাম এখানে লিখুন"
              value={headline}
              onChange={(e) => setHeadline && setHeadline(e.target.value)}
              className="font-serif-bangla text-lg font-medium"
            />
          )}

          {errors?.headline ? (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.headline.message}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              শুধুমাত্র বাংলা বর্ণমালায় ৩ থেকে ১৮ শব্দের শিরোনাম লিখুন। 
            </p>
          )}
        </div>

        {/* 2. Summary / Lead Field (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="summary" className="text-sm font-semibold text-slate-800">
              সংক্ষিপ্ত ভূমিকা / সারাংশ
            </Label>
            <span className="text-xs text-slate-400">(ঐচ্ছিক)</span>
          </div>

          {register ? (
            <Textarea
              id="summary"
              rows={2}
              placeholder="সংবাদের মূল বার্তা বা হাইলাইট এখানে সংক্ষেপে তুলে ধরুন"
              {...register("summary")}
              className={`font-serif-bangla text-sm transition-colors ${
                errors?.summary ? "border-red-500 focus:border-red-600 ring-1 ring-red-500/20" : ""
              }`}
            />
          ) : (
            <Textarea
              id="summary"
              rows={2}
              placeholder="সংবাদের মূল বার্তা বা হাইলাইট এখানে সংক্ষেপে তুলে ধরুন"
              value={summary}
              onChange={(e) => setSummary && setSummary(e.target.value)}
              className="font-serif-bangla text-sm"
            />
          )}

          {errors?.summary ? (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.summary.message}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              ঐচ্ছিক; ৫ থেকে ৫০ শব্দের মধ্যে লিখুন। সংবাদ কার্ড ও সোশ্যাল মিডিয়া প্রিভিউতে প্রদর্শিত হবে।
            </p>
          )}
        </div>

        {/* 3. Detailed Article Body (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="content-editor" className="text-sm font-semibold text-slate-800">
              বিস্তারিত সংবাদ
            </Label>
            <span className="text-xs text-slate-400">(ঐচ্ছিক)</span>
          </div>

          {control ? (
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={(jsonString) => field.onChange(jsonString)}
                  error={!!errors?.content}
                />
              )}
            />
          ) : (
            <RichTextEditor
              value={content}
              onChange={(jsonString) => setContent && setContent(jsonString)}
              error={!!errors?.content}
            />
          )}

          {errors?.content ? (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.content.message}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              ঐচ্ছিক; সম্পূর্ণ সংবাদ লিখুন (১০ থেকে ৪,০০০ শব্দ)।
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
