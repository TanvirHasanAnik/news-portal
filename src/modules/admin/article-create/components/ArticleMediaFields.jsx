"use client";

import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Video,
  FileCheck,
  Star,
  ArrowLeftRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { convertImageToWebP } from "@/utils/imageConverter";

const MAX_IMAGES = 3;

export default function ArticleMediaFields({
  images = [],
  setImages,
  imageUrl,
  setImageUrl,
  youtubeUrl,
  setYoutubeUrl,
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Normalize image list (supports both new 'images' array and legacy 'imageUrl' prop)
  const imageList = Array.isArray(images)
    ? images
    : imageUrl
    ? [imageUrl]
    : [];

  const updateImageList = (newList) => {
    const capped = newList.slice(0, MAX_IMAGES);
    if (setImages) {
      setImages(capped);
    }
    if (setImageUrl) {
      setImageUrl(capped[0] || "");
    }
  };

  /**
   * Uploads one or more files to Cloudflare R2 bucket
   */
  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - imageList.length;
    if (remainingSlots <= 0) {
      setUploadError(`সর্বোচ্চ ${MAX_IMAGES}টি ছবি যোগ করা যাবে।`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Validation
    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        setUploadError("অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPEG, PNG, WebP, AVIF) নির্বাচন করুন।");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`'${file.name}' ছবির আকার ১০ মেগাবাইটের বেশি।`);
        return;
      }
    }

    setIsUploading(true);
    setUploadStatus("ছবি প্রসেস করা হচ্ছে...");
    setUploadError(null);
    setUploadSuccess(null);

    const uploadedUrls = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const rawFile = filesToUpload[i];

        // 1. Client-Side Conversion to WebP with 0.82 quality setting
        setUploadStatus(`ছবি #${i + 1} প্রসেস করা হচ্ছে...`);
        const webpFile = await convertImageToWebP(rawFile, 0.82);

        // 2. Upload WebP file to Cloudflare R2
        setUploadStatus(`ছবি #${i + 1} আপলোড করা হচ্ছে...`);
        const formData = new FormData();
        formData.append("file", webpFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে।");
        }

        uploadedUrls.push(data.url);
      }

      const updated = [...imageList, ...uploadedUrls].slice(0, MAX_IMAGES);
      updateImageList(updated);
      setUploadSuccess(
        `${uploadedUrls.length}টি ছবি সফলভাবে আপলোড হয়েছে!`
      );
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "ছবি আপলোড করার সময় প্রযুক্তিগত সমস্যা দেখা দিয়েছে।");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesUpload(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesUpload(files);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = imageList.filter((_, idx) => idx !== indexToRemove);
    updateImageList(updated);
    setUploadSuccess(null);
    setUploadError(null);
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const item = imageList[index];
    const rest = imageList.filter((_, idx) => idx !== index);
    updateImageList([item, ...rest]);
  };

  const remainingCount = MAX_IMAGES - imageList.length;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            মিডিয়া ও ফিচার্ড ছবি
          </CardTitle>
          <Badge
            variant="outline"
            className={`font-mono text-xs ${
              imageList.length === MAX_IMAGES
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-slate-50 text-slate-700"
            }`}
          >
            {imageList.length} / {MAX_IMAGES} টি ছবি
          </Badge>
        </div>
        <CardDescription>
          সংবাদের জন্য ছবি নির্বাচন করুন (সর্বোচ্চ {MAX_IMAGES}টি ছবি যুক্ত করতে পারবেন)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          multiple
          className="hidden"
          id="r2-image-upload-multi"
        />

        {/* Upload Dropzone (Visible only if fewer than 3 images) */}
        {remainingCount > 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/50 scale-[1.005]"
                : "border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50"
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-11 h-11 rounded-full bg-white shadow-xs flex items-center justify-center text-indigo-600 border border-slate-200">
                {isUploading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                ) : (
                  <UploadCloud className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {isUploading
                    ? uploadStatus || "ছবি প্রসেস ও আপলোড করা হচ্ছে..."
                    : `ছবি আপলোড করতে ক্লিক করুন অথবা টেনে আনুন (বাকি আছে ${remainingCount}টি)`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  যেকোনো সাধারণ ফরম্যাটের ছবি নির্বাচন করুন (প্রতিটি সর্বোচ্চ ১০MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
            <span className="font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              সর্বোচ্চ {MAX_IMAGES}টি ছবি যুক্ত করা হয়েছে। নতুন ছবি যোগ করতে পূর্বের ছবি মুছুন।
            </span>
          </div>
        )}

        {/* Status Alerts */}
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

        {/* Uploaded Images Grid (Max 3) */}
        {imageList.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">সংযুক্ত ছবিসমূহ:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {imageList.map((imgSrc, index) => {
                const isPrimary = index === 0;

                return (
                  <div
                    key={index}
                    className="relative group rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                  >
                    {/* Badge */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                      {isPrimary ? (
                        <Badge className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 gap-1 font-semibold shadow-xs">
                          <Star className="w-3 h-3 fill-current" /> প্রধান ছবি
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-slate-900/70 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5"
                        >
                          ছবি #{index + 1}
                        </Badge>
                      )}
                    </div>

                    {/* Image Aspect Box */}
                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgSrc}
                        alt={`সংবাদের ছবি ${index + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>

                    {/* Actions bar */}
                    <div className="p-2 flex items-center justify-end bg-slate-50 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        {!isPrimary && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetPrimary(index)}
                            className="h-6 text-[10px] px-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                            title="এটিকে প্রধান ছবি হিসেবে নির্ধারণ করুন"
                          >
                            <ArrowLeftRight className="w-3 h-3 mr-1" /> প্রধান করুন
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="ছবি মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
  );
}
