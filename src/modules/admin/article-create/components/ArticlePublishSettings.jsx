"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ArticlePublishSettings({
  status,
  setStatus,
  categorySlug,
  setCategorySlug,
  subcategoryName,
  setSubcategoryName,
  categories = [],
  availableSubcategories = [],
  authorName,
  setAuthorName,
  location,
  setLocation,
}) {
  return (
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
  );
}

