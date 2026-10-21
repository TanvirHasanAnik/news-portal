"use client";

import React from "react";
import { Image as ImageIcon, Eye, Video } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ArticleMediaFields({
  imageUrl,
  setImageUrl,
  imageCaption,
  setImageCaption,
  youtubeUrl,
  setYoutubeUrl,
}) {
  return (
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
  );
}

