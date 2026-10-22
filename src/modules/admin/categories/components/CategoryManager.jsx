"use client";

import React, { useState, useTransition } from "react";
import { FolderTree, Plus, Trash2, X, Tag, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCategoryAction,
  deleteCategoryAction,
  createSubcategoryAction,
  deleteSubcategoryAction,
} from "@/actions/categoryActions";

export function CategoryManager({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [subcategoryModalCat, setSubcategoryModalCat] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);

  // Form states
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catOrder, setCatOrder] = useState("0");

  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subOrder, setSubOrder] = useState("0");

  // Create Category Handler
  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!catName || !catSlug) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", catName);
      formData.append("slug", catSlug);
      formData.append("sortOrder", catOrder);

      const res = await createCategoryAction(null, formData);
      if (res.success) {
        setCategories((prev) => [
          ...prev,
          {
            id: `cat_${catSlug}`,
            name: catName,
            slug: catSlug,
            sort_order: Number(catOrder),
            is_permanent: 0,
            subcategories: [],
          },
        ]);
        setFeedback({ type: "success", message: res.message });
        setCatName("");
        setCatSlug("");
        setCatOrder("0");
        setShowAddCategory(false);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  // Delete Category Handler
  const handleDeleteCategory = (cat) => {
    if (cat.is_permanent) {
      alert("স্থায়ী ক্যাটাগরি মুছে ফেলা যাবে না।");
      return;
    }
    if (!confirm(`আপনি কি নিশ্চিত যে "${cat.name}" ক্যাটাগরি এবং এর সকল সাব-ক্যাটাগরি মুছে ফেলতে চান?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCategoryAction(cat.id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  // Create Subcategory Handler
  const handleCreateSubcategory = (e) => {
    e.preventDefault();
    if (!subcategoryModalCat || !subName || !subSlug) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("categoryId", subcategoryModalCat.id);
      formData.append("name", subName);
      formData.append("slug", subSlug);
      formData.append("sortOrder", subOrder);

      const res = await createSubcategoryAction(null, formData);
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => {
            if (c.id === subcategoryModalCat.id) {
              return {
                ...c,
                subcategories: [
                  ...(c.subcategories || []),
                  { id: `sub_${Date.now()}`, name: subName, slug: subSlug, sort_order: Number(subOrder) },
                ],
              };
            }
            return c;
          })
        );
        setFeedback({ type: "success", message: res.message });
        setSubName("");
        setSubSlug("");
        setSubOrder("0");
        setSubcategoryModalCat(null);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  // Delete Subcategory Handler
  const handleDeleteSubcategory = (categoryId, subcategoryId, subName) => {
    if (!confirm(`"${subName}" সাব-ক্যাটাগরি মুছে ফেলতে চান?`)) return;

    startTransition(async () => {
      const res = await deleteSubcategoryAction(subcategoryId);
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => {
            if (c.id === categoryId) {
              return {
                ...c,
                subcategories: (c.subcategories || []).filter((s) => s.id !== subcategoryId),
              };
            }
            return c;
          })
        );
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>×</button>
        </div>
      )}

      {/* Top action row */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">
          মোট ক্যাটাগরি সংখ্যা: {categories.length} টি
        </p>
        <Button
          onClick={() => setShowAddCategory((prev) => !prev)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8.5 gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showAddCategory ? "ফর্ম বন্ধ করুন" : "নতুন ক্যাটাগরি তৈরি করুন"}
        </Button>
      </div>

      {/* Add New Category Box */}
      {showAddCategory && (
        <form
          onSubmit={handleCreateCategory}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-slate-900">নতুন ক্যাটাগরি ফরম</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ক্যাটাগরির নাম (বাংলা)
              </label>
              <Input
                type="text"
                placeholder="যেমন: পরিবেশ ও জলবায়ু"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                স্লাগ (English Slug)
              </label>
              <Input
                type="text"
                placeholder="যেমন: environment"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সাজানোর ক্রম (Sort Order)
              </label>
              <Input
                type="number"
                placeholder="10"
                value={catOrder}
                onChange={(e) => setCatOrder(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddCategory(false)}
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              ক্যাটাগরি সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      )}

      {/* Categories Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                    /{cat.slug}
                  </Badge>
                  {cat.is_permanent ? (
                    <Badge variant="outline" className="text-[9px] py-0 text-slate-400">
                      স্থায়ী
                    </Badge>
                  ) : null}
                </div>

                {!cat.is_permanent && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                    title="ক্যাটাগরি মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Subcategories list */}
              <div className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    উপ-বিভাগ ({cat.subcategories?.length || 0}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setSubcategoryModalCat(cat)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    সাব-ক্যাটাগরি যোগ করুন
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {cat.subcategories && cat.subcategories.length > 0 ? (
                    cat.subcategories.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs group"
                      >
                        <span>{sub.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubcategory(cat.id, sub.id, sub.name)}
                          className="text-slate-400 hover:text-red-600 cursor-pointer"
                          title="মুছুন"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      কোনো সাব-ক্যাটাগরি যোগ করা হয়নি
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
              <span>ক্রম: #{cat.sort_order || 0}</span>
              <span>আইডি: {cat.slug}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Subcategory Add Modal */}
      {subcategoryModalCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                "{subcategoryModalCat.name}" এর অধীনে সাব-ক্যাটাগরি
              </h3>
              <button
                onClick={() => setSubcategoryModalCat(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubcategory} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সাব-ক্যাটাগরির নাম (বাংলা)
                </label>
                <Input
                  type="text"
                  placeholder="যেমন: রাজধানী"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  স্লাগ (English Slug)
                </label>
                <Input
                  type="text"
                  placeholder="যেমন: capital"
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সাজানোর ক্রম
                </label>
                <Input
                  type="number"
                  placeholder="1"
                  value={subOrder}
                  onChange={(e) => setSubOrder(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSubcategoryModalCat(null)}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  যোগ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

