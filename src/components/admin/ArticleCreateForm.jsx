"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  FileText,
  Send,
  Eye,
  Image as ImageIcon,
  Video,
  Sparkles,
  Flame,
  Star,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { createArticleAction } from "@/actions/articleActions";

export default function ArticleCreateForm({ categories = [] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);

  // Form State
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[2]?.slug || "national");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [authorName, setAuthorName] = useState("নিজস্ব প্রতিবেদক");
  const [location, setLocation] = useState("ঢাকা");
  const [status, setStatus] = useState("published");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isLead, setIsLead] = useState(false);
  const [isHandpicked, setIsHandpicked] = useState(false);

  // Selected Category's subcategories
  const selectedCategory = categories.find((c) => c.slug === categorySlug);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Content stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedMins = Math.max(1, Math.ceil(wordCount / 180));

  // Reset form
  const handleReset = () => {
    setHeadline("");
    setSummary("");
    setContent("");
    setImageUrl("");
    setImageCaption("");
    setYoutubeUrl("");
    setIsBreaking(false);
    setIsLead(false);
    setIsHandpicked(false);
    setResult(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setResult(null);

    const formData = new FormData();
    formData.append("headline", headline);
    formData.append("summary", summary);
    formData.append("content", content);
    formData.append("categorySlug", categorySlug);
    formData.append("subcategoryName", subcategoryName);
    formData.append("image", imageUrl);
    formData.append("imageCaption", imageCaption);
    formData.append("youtubeUrl", youtubeUrl);
    formData.append("authorName", authorName);
    formData.append("location", location);
    formData.append("status", status);
    formData.append("isBreaking", String(isBreaking));
    formData.append("isLead", String(isLead));
    formData.append("isHandpicked", String(isHandpicked));

    startTransition(async () => {
      const res = await createArticleAction(null, formData);
      setResult(res);
      if (res?.success) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success / Error Notification Alert */}
      {result?.success && (
        <Alert variant="success" className="animate-slide-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <AlertTitle className="text-emerald-900 font-bold">অভিনন্দন! সফলভাবে সম্পন্ন হয়েছে</AlertTitle>
          <AlertDescription className="text-emerald-800 space-y-2 mt-1">
            <p>{result.message}</p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                onClick={handleReset}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> নতুন আরেকটি সংবাদ লিখুন
              </Button>
              {result.slug && (
                <Link
                  href={`/article/${result.slug}`}
                  target="_blank"
                  className="inline-flex items-center text-xs font-semibold text-emerald-900 underline hover:text-emerald-700"
                >
                  ওয়েবসাইটে দেখুন <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Link>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {result && !result.success && (
        <Alert variant="destructive" className="animate-slide-in">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">সংরক্ষণ ব্যর্থ হয়েছে</AlertTitle>
          <AlertDescription className="mt-1">
            <p>{result.message}</p>
            {result.errors && (
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                {Object.values(result.errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Primary Content */}
        <div className="lg:col-span-2 space-y-6">
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
                <Badge variant="outline" className="text-slate-600 font-mono">
                  {headline.length} অক্ষর
                </Badge>
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
                  placeholder="যেমন: অর্থনৈতিক করিডোর সম্প্রসারণে নতুন চুক্তি স্বাক্ষর"
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
                  placeholder="সংবাদের মূল সারসংক্ষেপ এক বা দুই বাক্যে..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="font-serif-bangla text-sm"
                />
              </div>

              {/* Detailed Article Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-sm font-semibold text-slate-800">
                    বিস্তারিত সংবাদ <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>আনুমানিক {estimatedMins} মিনিট পাঠ ({wordCount} শব্দ)</span>
                  </div>
                </div>
                <Textarea
                  id="content"
                  rows={10}
                  placeholder="এখানে সম্পূর্ণ সংবাদ প্যারাগ্রাফ আকারে লিখুন..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="font-serif-bangla text-base leading-relaxed"
                  required
                />
                <p className="text-xs text-slate-400">
                  টিপস: প্রতিটি নতুন অনুচ্ছেদের জন্য ডাবল এন্টার চাপুন।
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Media & Attachments Card (Assets / Cloudflare R2 / YouTube) */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                মিডিয়া ও অ্যাসেট সংযুক্তি (R2 / ওয়েব)
              </CardTitle>
              <CardDescription>
                ফিচার্ড ইমেজ (Cloudflare R2 বাকেট লিঙ্ক বা ইমেজ URL) ও ইউটিউব ভিডিও এম্বেড
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="imageUrl" className="text-sm font-semibold text-slate-800">
                    ছবির লিঙ্ক (Image URL / R2 Key)
                  </Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://... বা /lead-story-demo.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="imageCaption" className="text-sm font-semibold text-slate-800">
                    ছবির ক্যাপশন ও কৃতজ্ঞতা
                  </Label>
                  <Input
                    id="imageCaption"
                    placeholder="যেমন: ফাইল ছবি / রয়টার্স"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                  />
                </div>
              </div>

              {/* Live Image Preview */}
              {imageUrl && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> ছবির প্রিভিউ:
                  </p>
                  <div className="relative aspect-video w-full max-w-md overflow-hidden rounded border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  {imageCaption && (
                    <p className="text-xs text-slate-500 italic">{imageCaption}</p>
                  )}
                </div>
              )}

              <Separator />

              {/* YouTube Video URL */}
              <div className="space-y-1.5">
                <Label htmlFor="youtubeUrl" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-600" /> ইউটিউব ভিডিও লিঙ্ক (ঐচ্ছিক)
                </Label>
                <Input
                  id="youtubeUrl"
                  placeholder="যেমন: https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Metadata, Curation, Publishing Controls */}
        <div className="space-y-6">
          {/* Publishing & Category Settings Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">
                প্রকাশনা ও শ্রেণিবিন্যাস
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Status */}
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-sm font-semibold text-slate-800">
                  সংবাদের অবস্থা (Status)
                </Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent font-medium"
                >
                  <option value="published">সরাসরি প্রকাশ (Published)</option>
                  <option value="draft">খসড়া হিসেবে সংরক্ষণ (Draft)</option>
                  <option value="pending_approval">অনুমোদনের অপেক্ষায় (Pending Review)</option>
                </select>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm font-semibold text-slate-800">
                  বিভাগ (Category) <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  value={categorySlug}
                  onChange={(e) => {
                    setCategorySlug(e.target.value);
                    setSubcategoryName("");
                  }}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent font-medium"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="subcategory" className="text-sm font-semibold text-slate-800">
                  উপ-বিভাগ (Subcategory)
                </Label>
                <select
                  id="subcategory"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent"
                  disabled={availableSubcategories.length === 0}
                >
                  <option value="">-- কোনোটি নয় / মূল বিভাগ --</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <Separator />

              {/* Author & Location */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="authorName" className="text-sm font-semibold text-slate-800">
                    প্রতিবেদকের নাম
                  </Label>
                  <Input
                    id="authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="যেমন: বিশেষ প্রতিবেদক"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-sm font-semibold text-slate-800">
                    প্রতিবেদনের স্থান
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ঢাকা"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Curation & Placement Toggles Card */}
          <Card className="border-slate-200 shadow-sm bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                কিউরেশন ও বিশেষ ডিসপ্লে
              </CardTitle>
              <CardDescription className="text-xs">
                হোমপেজ ও টিকার সেকশনের স্থান নির্ধারণ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* Breaking News Toggle */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">ব্রেকিং নিউজ</div>
                    <div className="text-xs text-slate-500">হোমপেজের লাল টিকারে চলবে</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="w-4 h-4 accent-red-600 cursor-pointer"
                />
              </label>

              {/* Lead Story Toggle */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">প্রধান সংবাদ (Lead)</div>
                    <div className="text-xs text-slate-500">হোমপেজের প্রধান হিরো স্পটে</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isLead}
                  onChange={(e) => setIsLead(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </label>

              {/* Handpicked Toggle */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">বাছাইকৃত (Handpicked)</div>
                    <div className="text-xs text-slate-500">বাছাইকৃত সংবাদ সেকশনে থাকবে</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isHandpicked}
                  onChange={(e) => setIsHandpicked(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 cursor-pointer"
                />
              </label>
            </CardContent>
          </Card>

          {/* Action Submission Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isPending}
                className="w-full text-base font-bold shadow-md bg-red-600 hover:bg-red-700"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> সংরক্ষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> {status === "published" ? "সংবাদ প্রকাশ করুন" : "খসড়া সংরক্ষণ করুন"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isPending}
                className="w-full text-slate-500 hover:text-slate-800"
              >
                ফর্ম রিসেট করুন
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

