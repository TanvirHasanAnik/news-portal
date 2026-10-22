"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FolderTree,
  Plus,
  Trash2,
  X,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { saveCategoriesBatchAction } from "@/actions/categoryActions";
import { categorySchema, safeBanglaCategoryName } from "@/schemas/categorySchema";
import { safeSlug } from "@/schemas/baseSchema";
import { z } from "zod";

const subcategoryFormSchema = z.object({
  name: safeBanglaCategoryName({ label: "উপ-বিভাগের নাম", min: 2, max: 60 }),
  slug: safeSlug({ label: "উপ-বিভাগের স্লাগ", min: 2, max: 60, required: true }),
});

export function CategoryManager({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isDirty, setIsDirty] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [subcategoryModalCat, setSubcategoryModalCat] = useState(null);
  const [isSaving, startSavingTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [alertConfig, setAlertConfig] = useState(null);

  // React Hook Form for Category Add Form (real-time validation)
  const {
    register: registerCat,
    handleSubmit: handleSubmitCat,
    reset: resetCat,
    formState: { errors: catErrors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // React Hook Form for Subcategory Add Modal (real-time validation)
  const {
    register: registerSub,
    handleSubmit: handleSubmitSub,
    reset: resetSub,
    formState: { errors: subErrors },
  } = useForm({
    resolver: zodResolver(subcategoryFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // Local addition of category to browser state
  const onAddCategory = (data) => {
    const cleanSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (categories.some((c) => c.slug === cleanSlug)) {
      setAlertConfig({ message: "এই স্লাগটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে ভিন্ন স্লাগ লিখুন।" });
      return;
    }

    const newCategory = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      slug: cleanSlug,
      sort_order: (categories.length + 1) * 10,
      is_permanent: 0,
      subcategories: [],
    };

    setCategories((prev) => [...prev, newCategory]);
    setIsDirty(true);
    resetCat({ name: "", slug: "" });
    setShowAddCategory(false);
  };

  // Local removal of category from browser state with confirmation
  const handleDeleteCategory = (cat) => {
    if (cat.is_permanent || cat.slug === "latest" || cat.slug === "handpicked") {
      setAlertConfig({ message: "স্থায়ী ক্যাটাগরি মুছে ফেলা যাবে না।" });
      return;
    }

    setConfirmConfig({
      message: `আপনি কি নিশ্চিতভাবে "${cat.name}" ক্যাটাগরি এবং এর সকল উপ-বিভাগ বাদ দিতে চান?`,
      confirmVariant: "destructive",
      onConfirm: () => {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        setIsDirty(true);
        setConfirmConfig(null);
      },
    });
  };

  // Local addition of subcategory to browser state
  const onAddSubcategory = (data) => {
    if (!subcategoryModalCat) return;

    const cleanSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const parentCat = categories.find((c) => c.id === subcategoryModalCat.id);
    if (parentCat?.subcategories?.some((s) => s.slug === cleanSlug)) {
      setAlertConfig({ message: "এই ক্যাটাগরিতে এই স্লাগটি ইতিমধ্যে রয়েছে। ভিন্ন স্লাগ লিখুন।" });
      return;
    }

    const newSubcategory = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      category_id: subcategoryModalCat.id,
      name: data.name.trim(),
      slug: cleanSlug,
      sort_order: ((parentCat?.subcategories?.length || 0) + 1) * 10,
    };

    setCategories((prev) =>
      prev.map((c) =>
        c.id === subcategoryModalCat.id
          ? { ...c, subcategories: [...(c.subcategories || []), newSubcategory] }
          : c
      )
    );

    setIsDirty(true);
    resetSub({ name: "", slug: "" });
    setSubcategoryModalCat(null);
  };

  // Local removal of subcategory from browser state with confirmation
  const handleDeleteSubcategory = (categoryId, sub) => {
    setConfirmConfig({
      message: `আপনি কি নিশ্চিতভাবে "${sub.name}" উপ-বিভাগটি মুছে ফেলতে চান?`,
      confirmVariant: "destructive",
      onConfirm: () => {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId
              ? { ...c, subcategories: (c.subcategories || []).filter((s) => s.id !== sub.id) }
              : c
          )
        );
        setIsDirty(true);
        setConfirmConfig(null);
      },
    });
  };

  // Re-confirmation before discarding local changes
  const requestDiscard = () => {
    setConfirmConfig({
      message: "আপনি কি নিশ্চিত যে সকল অসংরক্ষিত পরিবর্তন বাতিল করতে চান?",
      onConfirm: () => {
        setCategories(initialCategories);
        setIsDirty(false);
        setConfirmConfig(null);
        setFeedback({ type: "info", message: "সকল পরিবর্তন বাতিল করা হয়েছে।" });
        setTimeout(() => setFeedback(null), 3000);
      },
    });
  };

  // Re-confirmation before saving batch changes to database & update live site
  const requestSave = () => {
    setConfirmConfig({
      message: "আপনি কি নিশ্চিতভাবে ক্যাটাগরির সকল পরিবর্তন সংরক্ষণ করতে চান?",
      onConfirm: () => {
        setConfirmConfig(null);
        startSavingTransition(async () => {
          const res = await saveCategoriesBatchAction(categories);
          if (res.success) {
            setIsDirty(false);
            setFeedback({ type: "success", message: res.message });
          } else {
            setAlertConfig({ message: res.message || "সংরক্ষণ সম্পন্ন করা যায়নি।" });
          }
          setTimeout(() => setFeedback(null), 4000);
        });
      },
    });
  };

  // Separate dynamic categories from permanent system categories
  const dynamicCats = categories.filter(
    (c) => !c.is_permanent && c.slug !== "latest" && c.slug !== "handpicked"
  );

  // Move dynamic category up for priority sorting
  const handleMoveCategoryUp = (catId) => {
    const dynIdx = dynamicCats.findIndex((c) => c.id === catId);
    if (dynIdx <= 0) return;

    const targetCat = dynamicCats[dynIdx - 1];

    setCategories((prev) => {
      const currentIdx = prev.findIndex((c) => c.id === catId);
      const targetIdx = prev.findIndex((c) => c.id === targetCat.id);
      if (currentIdx === -1 || targetIdx === -1) return prev;

      const newCats = [...prev];
      const temp = newCats[currentIdx];
      newCats[currentIdx] = newCats[targetIdx];
      newCats[targetIdx] = temp;

      return newCats.map((c, i) => ({ ...c, sort_order: (i + 1) * 10 }));
    });
    setIsDirty(true);
  };

  // Move dynamic category down for priority sorting
  const handleMoveCategoryDown = (catId) => {
    const dynIdx = dynamicCats.findIndex((c) => c.id === catId);
    if (dynIdx === -1 || dynIdx >= dynamicCats.length - 1) return;

    const targetCat = dynamicCats[dynIdx + 1];

    setCategories((prev) => {
      const currentIdx = prev.findIndex((c) => c.id === catId);
      const targetIdx = prev.findIndex((c) => c.id === targetCat.id);
      if (currentIdx === -1 || targetIdx === -1) return prev;

      const newCats = [...prev];
      const temp = newCats[currentIdx];
      newCats[currentIdx] = newCats[targetIdx];
      newCats[targetIdx] = temp;

      return newCats.map((c, i) => ({ ...c, sort_order: (i + 1) * 10 }));
    });
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Status & Save Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isDirty ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              অসংরক্ষিত পরিবর্তন রয়েছে
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              সব পরিবর্তন সংরক্ষিত
            </span>
          )}
          <span className="text-xs text-slate-500 hidden sm:inline">
            মোট সক্রিয় ক্যাটাগরি: {dynamicCats.length}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={requestDiscard}
              className="text-xs h-9 px-3 text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              বাতিল করুন
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            disabled={isSaving || !isDirty}
            onClick={requestSave}
            className={`text-xs h-9 px-4 gap-1.5 shadow-xs font-medium cursor-pointer transition-all ${
              isDirty
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                পরিবর্তন সংরক্ষণ করুন
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : feedback.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-slate-50 text-slate-800 border border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 font-bold px-1 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Section Header & Add Category Button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-emerald-600" />
            সংবাদ ক্যাটাগরি তালিকা ({dynamicCats.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            বিষয়ভিত্তিক সংবাদ বিভাগ ও সংশ্লিষ্ট উপ-বিভাগ পরিচালনা করুন
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setShowAddCategory((prev) => !prev)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          {showAddCategory ? "ফর্ম বন্ধ করুন" : "নতুন ক্যাটাগরি যোগ করুন"}
        </Button>
      </div>

      {/* Add New Category Box with Real-Time React Hook Form Validation */}
      {showAddCategory && (
        <form
          onSubmit={handleSubmitCat(onAddCategory)}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">নতুন ক্যাটাগরি তৈরি</h3>
            <span className="text-[11px] text-slate-400">
              যোগ করার পর উপরের সংরক্ষণ বোতামে চাপুন
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ক্যাটাগরির নাম (বাংলা) <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="যেমন: পরিবেশ ও জলবায়ু"
                {...registerCat("name")}
                className={`text-xs h-9 ${
                  catErrors.name ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
              {catErrors.name && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{catErrors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ইংরেজি স্লাগ (Slug) <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="যেমন: environment"
                {...registerCat("slug")}
                className={`text-xs h-9 font-mono ${
                  catErrors.slug ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
              {catErrors.slug && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{catErrors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                resetCat();
                setShowAddCategory(false);
              }}
              className="text-xs h-8.5 text-slate-600 border-slate-200"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8.5 px-4"
            >
              তালিকায় যোগ করুন
            </Button>
          </div>
        </form>
      )}

      {/* Dynamic Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dynamicCats.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            কোনো ক্যাটাগরি পাওয়া যায়নি। &ldquo;নতুন ক্যাটাগরি যোগ করুন&rdquo; বোতামে চাপুন।
          </div>
        ) : (
          dynamicCats.map((cat, dynIdx) => {
            const isFirst = dynIdx === 0;
            const isLast = dynIdx === dynamicCats.length - 1;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* Up/Down arrow buttons for category card sorting */}
                      <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5 border border-slate-200 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveCategoryUp(cat.id)}
                          disabled={isFirst || isSaving}
                          title="উপরে স্থানান্তর করুন"
                          className="p-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCategoryDown(cat.id)}
                          disabled={isLast || isSaving}
                          title="নিচে স্থানান্তর করুন"
                          className="p-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono text-slate-600">
                        /{cat.slug}
                      </Badge>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                      title="ক্যাটাগরি বাদ দিন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subcategories list */}
                  <div className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        উপ-বিভাগ ({cat.subcategories?.length || 0}):
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          resetSub({ name: "", slug: "" });
                          setSubcategoryModalCat(cat);
                        }}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        উপ-বিভাগ যোগ করুন
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        cat.subcategories.map((sub) => (
                          <span
                            key={sub.id}
                            className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs"
                          >
                            <span>{sub.name}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubcategory(cat.id, sub)}
                              className="text-slate-400 hover:text-red-600 cursor-pointer"
                              title="মুছুন"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          কোনো উপ-বিভাগ নেই
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                  <span>ক্রম: #{dynIdx + 1}</span>
                  <span>স্লাগ: /{cat.slug}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Subcategory Add Modal with React Hook Form Real-time Validation */}
      {subcategoryModalCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                &ldquo;{subcategoryModalCat.name}&rdquo; এর জন্য নতুন উপ-বিভাগ
              </h3>
              <button
                type="button"
                onClick={() => {
                  resetSub();
                  setSubcategoryModalCat(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitSub(onAddSubcategory)} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  উপ-বিভাগের নাম (বাংলা) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="যেমন: রাজধানী"
                  {...registerSub("name")}
                  className={`text-xs h-9 ${
                    subErrors.name ? "border-red-400 focus-visible:ring-red-400" : ""
                  }`}
                />
                {subErrors.name && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{subErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইংরেজি স্লাগ (Slug) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="যেমন: capital"
                  {...registerSub("slug")}
                  className={`text-xs h-9 font-mono ${
                    subErrors.slug ? "border-red-400 focus-visible:ring-red-400" : ""
                  }`}
                />
                {subErrors.slug && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{subErrors.slug.message}</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetSub();
                    setSubcategoryModalCat(null);
                  }}
                  className="text-xs h-8.5 text-slate-600 border-slate-200"
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8.5 px-4"
                >
                  উপ-বিভাগ যোগ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Re-confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmConfig)}
        onClose={() => setConfirmConfig(null)}
        onConfirm={confirmConfig?.onConfirm}
        message={confirmConfig?.message}
        confirmVariant={confirmConfig?.confirmVariant || "default"}
      />

      {/* Alert / Warning Modal */}
      <AlertModal
        isOpen={Boolean(alertConfig)}
        onClose={() => setAlertConfig(null)}
        message={alertConfig?.message}
      />
    </div>
  );
}
