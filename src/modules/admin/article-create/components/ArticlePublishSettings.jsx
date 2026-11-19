"use client";

import React, { useId } from "react";
import { AlertCircle, Calendar, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BANGLADESH_DISTRICTS } from "@/config/districts";
import { formatArticlePublishDate } from "@/utils/dateUtils";

export default function ArticlePublishSettings({
  categorySlug,
  setCategorySlug,
  subcategoryName = "",
  setSubcategoryName,
  categories = [],
  availableSubcategories = [],
  register,
  errors = {},
  watch,
  setValue,
  availableAuthorFullName = null,
  originalCreatedAt = null,
  representativeType: propRepType,
  isCustomDate: propIsCustomDate,
  hidePublishDate: propHidePublishDate,
  customPublishedAt: propCustomPublishedAt,
}) {
  const datalistId = useId();
  const sortedCategories = [
    ...categories.filter((c) => c.slug !== "others"),
    ...categories.filter((c) => c.slug === "others"),
  ];

  const representativeType = propRepType !== undefined
    ? propRepType
    : (watch ? watch("representativeType") : "online_desk");
  const isCustomDate = propIsCustomDate !== undefined
    ? propIsCustomDate
    : (watch ? Boolean(watch("isCustomDate")) : false);
  const hidePublishDate = propHidePublishDate !== undefined
    ? propHidePublishDate
    : (watch ? Boolean(watch("hidePublishDate")) : false);
  const customPublishedAt = propCustomPublishedAt !== undefined
    ? propCustomPublishedAt
    : (watch ? watch("customPublishedAt") : "");

  const defaultTimeDisplay = originalCreatedAt
    ? formatArticlePublishDate(originalCreatedAt, false)
    : "সংবাদ তৈরির সময় অনুযায়ী নির্ধারিত হবে";

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900">
          প্রকাশনা ও শ্রেণিবিন্যাস
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="category" className="text-sm font-semibold text-slate-800">
              বিভাগ (Category)
            </Label>
            <span className="text-xs text-slate-400">(ঐচ্ছিক - ডিফল্ট: অন্যান্য)</span>
          </div>
          {register ? (
            <select
              id="category"
              value={categorySlug || ""}
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
              <option value="">-- বিভাগ নির্বাচন করুন (ঐচ্ছিক) --</option>
              {sortedCategories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              id="category"
              value={categorySlug || ""}
              onChange={(e) => {
                if (setCategorySlug) setCategorySlug(e.target.value);
                if (setSubcategoryName) setSubcategoryName("");
              }}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0 focus:border-slate-300 font-medium cursor-pointer"
            >
              {sortedCategories.map((cat) => (
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

        <div className="pt-2 border-t border-slate-100 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="representativeType" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-slate-500" />
                প্রতিনিধি / বাইলাইন
              </Label>
              <span className="text-xs text-slate-400">(ডিফল্ট: অনলাইন ডেস্ক)</span>
            </div>

            {register && (
              <select
                id="representativeType"
                {...register("representativeType", {
                  onChange: (e) => {
                    const val = e.target.value;
                    if (setValue) {
                      if (val === "none") {
                        setValue("authorName", "");
                      } else if (val === "online_desk") {
                        setValue("authorName", "অনলাইন ডেস্ক");
                      } else if (val === "reporter") {
                        setValue("authorName", "নিজস্ব প্রতিবেদক");
                      } else if (val === "bss") {
                        setValue("authorName", "বাসস");
                      } else if (val === "author") {
                        setValue("authorName", availableAuthorFullName || "");
                      } else if (val === "custom") {
                        setValue("authorName", watch("customAuthorName") || "");
                      }
                    }
                  },
                })}
                className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0 font-medium cursor-pointer transition-colors ${
                  errors?.representativeType
                    ? "border-red-500 focus:border-red-600 ring-1 ring-red-500/20"
                    : "border-slate-300 focus:border-slate-400"
                }`}
              >
                <option value="online_desk">অনলাইন ডেস্ক</option>
                <option value="reporter">নিজস্ব প্রতিবেদক</option>
                <option value="bss">বাসস</option>
                {Boolean(availableAuthorFullName && availableAuthorFullName.trim()) && (
                  <option value="author">{availableAuthorFullName.trim()}</option>
                )}
                <option value="custom">কাস্টম নাম লিখুন</option>
                <option value="none">কোনোটি নয় (নাম প্রদর্শিত হবে না)</option>
              </select>
            )}

            {errors?.representativeType && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.representativeType.message}
              </p>
            )}
          </div>

          {representativeType === "custom" && register && (
            <div className="space-y-1.5 pl-3 border-l-2 border-slate-300">
              <Label htmlFor="customAuthorName" className="text-xs font-semibold text-slate-700">
                প্রতিনিধির নাম (বাংলা বা ইংরেজি)
              </Label>
              <input
                id="customAuthorName"
                type="text"
                maxLength={70}
                placeholder="প্রতিনিধির পূর্ণ নাম লিখুন..."
                {...register("customAuthorName", {
                  onChange: (e) => {
                    if (setValue) setValue("authorName", e.target.value);
                  },
                })}
                className={`flex h-9 w-full rounded-md border bg-white px-3 py-1.5 text-sm outline-none focus:outline-none focus:ring-0 transition-colors ${
                  errors?.customAuthorName
                    ? "border-red-500 focus:border-red-600 ring-1 ring-red-500/20"
                    : "border-slate-300 focus:border-slate-400"
                }`}
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>সর্বোচ্চ ৬ শব্দ বা ৭০ অক্ষর</span>
                <span>{(watch("customAuthorName") || "").length}/70</span>
              </div>
              {errors?.customAuthorName && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.customAuthorName.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="location" className="text-sm font-semibold text-slate-800">
                জেলা (ঐচ্ছিক)
              </Label>
              <span className="text-xs text-slate-400">বাইলাইনের পাশে প্রদর্শিত</span>
            </div>
            {register && (
              <input
                id="location"
                type="text"
                list={datalistId}
                maxLength={50}
                disabled={representativeType === "none"}
                placeholder={representativeType === "none" ? "প্রতিনিধি না থাকায় জেলা নিষ্ক্রিয়" : "জেলা লিখুন বা তালিকা থেকে বাছুন..."}
                {...register("location")}
                className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors ${
                  errors?.location
                    ? "border-red-500 focus:border-red-600 ring-1 ring-red-500/20"
                    : "border-slate-300 focus:border-slate-400"
                }`}
              />
            )}
            <datalist id={datalistId}>
              {BANGLADESH_DISTRICTS.map((district) => (
                <option key={district} value={district} />
              ))}
            </datalist>
            {errors?.location && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.location.message}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              প্রকাশনার তারিখ ও সময়
            </Label>
            <p className="text-xs text-slate-500 leading-relaxed">
              মূল সময়: <span className="font-medium text-slate-700">{defaultTimeDisplay}</span>
            </p>
          </div>

          {register && (
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="hidePublishDate"
                  {...register("hidePublishDate", {
                    onChange: (e) => {
                      if (e.target.checked && setValue) {
                        setValue("isCustomDate", false, { shouldValidate: true });
                      }
                    },
                  })}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0 focus:outline-none w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">
                  তারিখ ও সময় লুকান (পাবলিক পেইজে প্রদর্শিত হবে না)
                </span>
              </label>

              {!hidePublishDate && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="isCustomDate"
                      {...register("isCustomDate", {
                        onChange: (e) => {
                          if (e.target.checked && setValue && !customPublishedAt) {
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = String(now.getMonth() + 1).padStart(2, "0");
                            const day = String(now.getDate()).padStart(2, "0");
                            const hours = String(now.getHours()).padStart(2, "0");
                            const minutes = String(now.getMinutes()).padStart(2, "0");
                            setValue("customPublishedAt", `${year}-${month}-${day}T${hours}:${minutes}`, { shouldValidate: true });
                          }
                        },
                      })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0 focus:outline-none w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      তারিখ ও সময় পরিবর্তন করুন
                    </span>
                  </label>

                  {isCustomDate && (
                    <div className="space-y-2 pl-3 border-l-2 border-slate-300 pt-1">
                      <div className="relative">
                        <input
                          type="datetime-local"
                          id="customPublishedAt"
                          {...register("customPublishedAt")}
                          onClick={(e) => {
                            if (typeof e.target.showPicker === "function") {
                              try {
                                e.target.showPicker();
                              } catch {}
                            }
                          }}
                          className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:outline-none focus:ring-0 transition-colors cursor-pointer ${
                            errors?.customPublishedAt
                              ? "border-red-500 focus:border-red-600 ring-1 ring-red-500/20"
                              : "border-slate-300 focus:border-slate-400"
                          }`}
                        />
                      </div>
                      {customPublishedAt && (
                        <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-slate-900 shrink-0">নির্বাচিত সময়:</span>
                            <span className="truncate">{formatArticlePublishDate(customPublishedAt, false)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById("customPublishedAt");
                              if (input && typeof input.showPicker === "function") {
                                try {
                                  input.showPicker();
                                } catch {
                                  input.focus();
                                }
                              } else if (input) {
                                input.focus();
                              }
                            }}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline shrink-0 cursor-pointer"
                          >
                            ক্যালেন্ডার খুলুন
                          </button>
                        </div>
                      )}
                      {errors?.customPublishedAt && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.customPublishedAt.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
