"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ArticlePublishSettings({
  categorySlug,
  setCategorySlug,
  subcategoryName = "",
  setSubcategoryName,
  categories = [],
  availableSubcategories = [],
  register,
  errors = {},
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900">
          প্রকাশনা ও শ্রেণিবিন্যাস
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Category Dropdown (Mandatory) */}
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-sm font-semibold text-slate-800">
            বিভাগ (Category) <span className="text-red-500">*</span>
          </Label>
          {register ? (
            <select
              id="category"
              value={categorySlug}
              {...register("categorySlug", {
                onChange: () => {
                  if (setSubcategoryName) setSubcategoryName("");
                },
              })}
              className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0 font-medium cursor-pointer transition-colors ${
                errors?.categorySlug
                  ? "border-red-500 focus:border-red-600 ring-1 ring-red-500/20"
                  : "border-slate-300 focus:border-slate-400"
              }`}
            >
              <option value="">-- বিভাগ নির্বাচন করুন --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              id="category"
              value={categorySlug}
              onChange={(e) => {
                if (setCategorySlug) setCategorySlug(e.target.value);
                if (setSubcategoryName) setSubcategoryName("");
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
          )}

          {errors?.categorySlug && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.categorySlug.message}
            </p>
          )}
        </div>

        {/* Subcategory Dropdown (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="subcategory" className="text-sm font-semibold text-slate-800">
              উপ-বিভাগ (Subcategory)
            </Label>
            <span className="text-xs text-slate-400">(ঐচ্ছিক)</span>
          </div>

          {register ? (
            <select
              id="subcategory"
              value={subcategoryName}
              {...register("subcategoryName")}
              className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0 cursor-pointer disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors ${
                errors?.subcategoryName
                  ? "border-red-500 focus:border-red-600 ring-1 ring-red-500/20"
                  : "border-slate-300 focus:border-slate-400"
              }`}
              disabled={availableSubcategories.length === 0}
            >
              <option value="">-- কোনোটি নয় / মূল বিভাগ --</option>
              {availableSubcategories.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              id="subcategory"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName && setSubcategoryName(e.target.value)}
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
          )}

          {errors?.subcategoryName && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.subcategoryName.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
