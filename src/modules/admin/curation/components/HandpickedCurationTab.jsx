"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  BookmarkCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { saveCuratedBatchAction } from "@/actions/curationActions";
import { handpickedFormSchema } from "@/schemas/curationSchema";

export function HandpickedCurationTab({ initialItems = [], articles = [] }) {
  const [items, setItems] = useState(initialItems);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, startSavingTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [alertConfig, setAlertConfig] = useState(null);

  // Initialize React Hook Form with real-time validation via Zod
  const {
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(handpickedFormSchema),
    mode: "onChange",
    defaultValues: {
      articleId: "",
    },
  });

  const articleId = watch("articleId") || "";

  // Local-only addition to browser state on valid form submit
  const onAddItem = (data) => {
    const selectedArt = articles.find((a) => String(a.id) === String(data.articleId));
    if (!selectedArt) return;

    // Check if article is already in the handpicked list
    const isAlreadyAdded = items.some(
      (item) => item.article_id && String(item.article_id) === String(data.articleId)
    );
    if (isAlreadyAdded) {
      setAlertConfig({
        message: `"${selectedArt.headline}" সংবাদটি ইতিমধ্যে বাছাইকৃত তালিকায় যুক্ত রয়েছে। একই সংবাদ একাধিকবার যোগ করা সম্ভব নয়।`,
      });
      return;
    }

    const newItem = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: "handpicked",
      article_id: selectedArt.id,
      article_headline: selectedArt.headline,
      category_name: selectedArt.category_name || "সাধারণ",
      custom_title: "",
      is_active: 1,
      created_at: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
    setIsDirty(true);
    reset({ articleId: "" });
    clearErrors("articleId");
  };

  // Re-confirmation before toggling active/inactive
  const requestToggle = (item) => {
    const willHide = item.is_active === 1;
    setConfirmConfig({
      message: willHide
        ? "আপনি কি নিশ্চিতভাবে এই সংবাদটি সাময়িক আড়াল করতে চান?"
        : "আপনি কি নিশ্চিতভাবে এই সংবাদটি পুনরায় সক্রিয় করতে চান?",
      onConfirm: () => {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_active: i.is_active ? 0 : 1 } : i))
        );
        setIsDirty(true);
        setConfirmConfig(null);
      },
    });
  };

  // Re-confirmation before removing item from list
  const requestRemove = (id, headline) => {
    setConfirmConfig({
      message: `আপনি কি নিশ্চিতভাবে "${headline || "এই সংবাদটি"}" বাছাই তালিকা থেকে বাদ দিতে চান?`,
      confirmVariant: "destructive",
      onConfirm: () => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setIsDirty(true);
        setConfirmConfig(null);
      },
    });
  };

  // Local-only move up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
    setIsDirty(true);
  };

  // Local-only move down
  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
    setIsDirty(true);
  };

  // Re-confirmation before discarding local changes
  const requestDiscard = () => {
    setConfirmConfig({
      message: "আপনি কি নিশ্চিত যে সকল অসংরক্ষিত পরিবর্তন বাতিল করতে চান?",
      onConfirm: () => {
        setItems(initialItems);
        setIsDirty(false);
        setConfirmConfig(null);
        setFeedback({ type: "info", message: "সকল পরিবর্তন বাতিল করা হয়েছে।" });
        setTimeout(() => setFeedback(null), 3000);
      },
    });
  };

  // Re-confirmation before saving batch changes to database & trigger on-demand ISR
  const requestSave = () => {
    setConfirmConfig({
      message: "আপনি কি নিশ্চিতভাবে বাছাইকৃত সংবাদের সকল পরিবর্তন সংরক্ষণ করতে চান?",
      onConfirm: () => {
        setConfirmConfig(null);
        startSavingTransition(async () => {
          const res = await saveCuratedBatchAction("handpicked", items);
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

  return (
    <div className="space-y-6">
      {/* Save Action & Status Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isDirty ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              ব্রাউজারে অসংরক্ষিত পরিবর্তন রয়েছে
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              লাইভ ডেটাবেস ও ওয়েবসাইটের সাথে সিঙ্কড
            </span>
          )}
          <span className="text-xs text-slate-500 hidden md:inline">
            মোট বাছাইকৃত আইটেম: {items.length}
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
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                সংরক্ষণ ও আপডেট হচ্ছে...
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
            className="text-slate-400 hover:text-slate-700 font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Add New Handpicked Item Box with React Hook Form Real-time Validation */}
      <form
        onSubmit={handleSubmit(onAddItem)}
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-600" />
            নতুন বাছাইকৃত সংবাদ যুক্ত করুন
          </h3>
          <span className="text-xs text-slate-400">
            যোগ করার পর পরিবর্তন সংরক্ষণ বোতামে চাপুন
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          {/* Article selection dropdown */}
          <div className="flex-1 w-full">
            <label htmlFor="handpicked-article-select" className="block text-xs font-semibold text-slate-700 mb-1">
              প্রকাশিত সংবাদ নির্বাচন করুন <span className="text-red-500">*</span>
            </label>
            <select
              id="handpicked-article-select"
              value={articleId}
              onChange={(e) => {
                const val = e.target.value;
                setValue("articleId", val, { shouldValidate: true, shouldDirty: true });
                if (val) {
                  clearErrors("articleId");
                }
              }}
              className={`w-full h-9 rounded-md border bg-white px-3 py-1.5 text-xs text-slate-800 transition-colors focus:outline-none focus:border-slate-400 ${
                errors.articleId ? "border-red-400" : "border-slate-300"
              }`}
            >
              <option value="">-- সংবাদ নির্বাচন করুন --</option>
              {articles.map((art) => {
                const isAdded = items.some(
                  (item) => item.article_id && String(item.article_id) === String(art.id)
                );
                return (
                  <option key={art.id} value={art.id} disabled={isAdded}>
                    [{art.category_name || "সাধারণ"}] {art.headline} {isAdded ? " (ইতিমধ্যে যুক্ত)" : ""}
                  </option>
                );
              })}
            </select>
            {errors.articleId && (
              <p className="text-[11px] text-red-500 font-medium mt-1">{errors.articleId.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 px-4 gap-1.5 shadow-xs cursor-pointer shrink-0"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            তালিকায় যোগ করুন
          </Button>
        </div>

        <div className="pt-1">
          <p className="text-[11px] text-slate-500">
            তালিকায় যোগ হবে ব্রাউজার মেমরিতে। চূড়ান্ত করতে উপরের &ldquo;পরিবর্তন সংরক্ষণ করুন&rdquo; বোতামে চাপুন।
          </p>
        </div>
      </form>

      {/* Active Handpicked List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-800">
              বাছাইকৃত সংবাদ তালিকা ({items.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            ▲ / ▼ বোতাম চেপে ক্রম সাজান
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              এখনো কোনো সংবাদ বাছাইকৃত তালিকায় যুক্ত করা হয়নি।
            </div>
          ) : (
            items.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === items.length - 1;

              return (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    {/* Up / Down Reorder Buttons */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0 bg-slate-100/90 rounded-md p-0.5 border border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={isFirst || isSaving}
                        title="উপরে স্থানান্তর করুন"
                        className="p-1 rounded text-slate-600 hover:text-amber-700 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold font-mono text-slate-600 px-1 select-none">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={isLast || isSaving}
                        title="নিচে স্থানান্তর করুন"
                        className="p-1 rounded text-slate-600 hover:text-amber-700 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content details */}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.custom_title || item.article_headline || "শিরোনামহীন সংবাদ"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        {item.category_name && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                            {item.category_name}
                          </Badge>
                        )}
                        <span>
                          অবস্থা:{" "}
                          <span className={item.is_active ? "text-emerald-600 font-medium" : "text-slate-400"}>
                            {item.is_active ? "সক্রিয়" : "লুকানো"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => requestToggle(item)}
                      title={item.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                      className={`p-1.5 rounded cursor-pointer transition-colors ${
                        item.is_active
                          ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          : "text-slate-400 bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => requestRemove(item.id, item.custom_title || item.article_headline)}
                      title="তালিকা থেকে বাদ দিন"
                      className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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
