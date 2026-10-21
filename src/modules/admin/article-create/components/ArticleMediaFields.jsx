"use client";

import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Link as LinkIcon,
  Video,
  FileCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ArticleMediaFields({
  imageUrl,
  setImageUrl,
  imageCaption,
  setImageCaption,
  youtubeUrl,
  setYoutubeUrl,
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState("upload"); // "upload" | "url"

  /**
   * Handles file upload to Cloudflare R2 bucket
   */
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setUploadError("অনুগ্রহ করে একটি বৈধ ইমেজ ফাইল (JPEG, PNG, WebP, AVIF) নির্বাচন করুন।");
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("ছবির সর্বোচ্চ আকার ১০ মেগাবাইট (10MB)।");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে।");
      }

      // Successfully saved to Cloudflare R2
      setImageUrl(data.url);
      setUploadSuccess(`সফলভাবে R2 বাকেটে সংরক্ষিত: ${data.key}`);

      // Auto-populate caption if empty
      if (!imageCaption && file.name) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setImageCaption(cleanName);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "ছবি আপলোড করার সময় ত্রুটি ঘটেছে।");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setUploadSuccess(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isR2Url = imageUrl?.startsWith("/api/images/") || imageUrl?.includes("r2.dev");

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            মিডিয়া ও ফিচার্ড অ্যাসেট (Cloudflare R2)
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                inputMode === "upload"
                  ? "bg-indigo-50 text-indigo-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ফাইল আপলোড
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setInputMode("url")}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                inputMode === "url"
                  ? "bg-indigo-50 text-indigo-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              URL লিঙ্ক
            </button>
          </div>
        </div>
        <CardDescription>
          Cloudflare R2 বাকেটে সরাসরি ছবি আপলোড করুন অথবা এক্সটার্নাল ছবির লিঙ্ক ব্যবহার করুন
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Mode */}
        {inputMode === "upload" ? (
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              className="hidden"
              id="r2-image-upload"
            />

            {!imageUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50/50 scale-[1.005]"
                    : "border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-indigo-600 border border-slate-200">
                    {isUploading ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {isUploading
                        ? "ক্লাউডফ্লেয়ার R2 বাকেটে আপলোড করা হচ্ছে..."
                        : "ছবি আপলোড করতে ক্লিক করুন অথবা টেনে এনে ছেড়ে দিন"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      JPEG, PNG, WebP, AVIF ফরম্যাট সমর্থিত (সর্বোচ্চ ১০MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* Manual URL Mode */
          <div className="space-y-1.5">
            <Label htmlFor="imageUrl" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-slate-400" /> ছবির লিঙ্ক (Image URL বা R2 পথ)
            </Label>
            <Input
              id="imageUrl"
              placeholder="https://... বা /api/images/articles/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        )}

        {/* Upload Status Alerts */}
        {uploadError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium truncate">{uploadSuccess}</span>
          </div>
        )}

        {/* Live Image Preview & Management */}
        {imageUrl && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    isR2Url
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 text-xs gap-1"
                      : "bg-slate-100 text-slate-700 text-xs"
                  }
                >
                  {isR2Url && <FileCheck className="w-3.5 h-3.5" />}
                  {isR2Url ? "Cloudflare R2 Storage" : "Web External"}
                </Badge>
                <span className="text-xs text-slate-500 font-mono truncate max-w-xs sm:max-w-md">
                  {imageUrl}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 text-xs px-2.5"
                >
                  পরিবর্তন করুন
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="ছবি মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-xs">
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
          </div>
        )}

        {/* Image Caption & Credit */}
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
  );
}
