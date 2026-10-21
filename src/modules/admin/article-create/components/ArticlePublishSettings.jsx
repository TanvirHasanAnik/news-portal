"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ArticlePublishSettings({
  categorySlug,
  setCategorySlug,
  subcategoryName,
  setSubcategoryName,
  categories = [],
  availableSubcategories = [],
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900">
          প্রকাশনা ও শ্রেণিবিন্যাস
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
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
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0 focus:border-slate-300 font-medium cursor-pointer"
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
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0 focus:border-slate-300 cursor-pointer disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
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
      </CardContent>
    </Card>
  );
}
