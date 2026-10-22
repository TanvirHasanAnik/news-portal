"use client";

import React, { useState, useTransition } from "react";
import { ChevronUp, ChevronDown, Trash2, Eye, EyeOff, Plus, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addCuratedNewsAction,
  removeCuratedNewsAction,
  toggleCuratedNewsAction,
  reorderCuratedNewsAction,
} from "@/actions/curationActions";

export function BreakingCurationTab({ initialItems = [], articles = [] }) {
  const [items, setItems] = useState(initialItems);
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedArticleId && !customTitle.trim()) {
      alert("অনুগ্রহ করে একটি প্রকাশিত সংবাদ নির্বাচন করুন অথবা জরুরি সংবাদের শিরোনাম লিখুন।");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("type", "breaking");
      formData.append("articleId", selectedArticleId);
      formData.append("customTitle", customTitle.trim());
      formData.append("customUrl", customUrl.trim());

      const res = await addCuratedNewsAction(null, formData);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        const selectedArt = articles.find((a) => a.id === selectedArticleId);
        const newItem = {
          id: `cur_${Date.now()}`,
          type: "breaking",
          article_id: selectedArticleId,
          article_headline: selectedArt?.headline || customTitle,
          category_name: selectedArt?.category_name || "জরুরি",
          custom_title: customTitle,
          custom_url: customUrl,
          priority: (items.length + 1) * 10,
          is_active: 1,
          created_at: new Date().toISOString(),
        };
        const updated = [newItem, ...items];
        setItems(updated);
        setSelectedArticleId("");
        setCustomTitle("");
        setCustomUrl("");

        // Persist priority ordering so the new item is at the top
        await reorderCuratedNewsAction(updated.map((it) => it.id));
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleToggle = (id, currentActive) => {
    startTransition(async () => {
      await toggleCuratedNewsAction(id, currentActive);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: currentActive ? 0 : 1 } : item
        )
      );
    });
  };

  const handleRemove = (id) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই ব্রেকিং নিউজটি তালিকা থেকে বাদ দিতে চান?")) return;
    startTransition(async () => {
      await removeCuratedNewsAction(id);
      const remaining = items.filter((item) => item.id !== id);
      setItems(remaining);
      setFeedback({ type: "success", message: "ব্রেকিং তালিকা থেকে সরানো হয়েছে।" });
      setTimeout(() => setFeedback(null), 3000);
      if (remaining.length > 0) {
        await reorderCuratedNewsAction(remaining.map((it) => it.id));
      }
    });
  };

  const handleMoveUp = (index) => {
    if (index === 0 || isPending) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);

    startTransition(async () => {
      await reorderCuratedNewsAction(newItems.map((it) => it.id));
    });
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1 || isPending) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);

    startTransition(async () => {
      await reorderCuratedNewsAction(newItems.map((it) => it.id));
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Add New Breaking Item Box */}
      <form
        onSubmit={handleAddItem}
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-red-600" />
            নতুন জরুরি ব্রেকিং নিউজ যুক্ত করুন
          </h3>
          <span className="text-xs text-slate-400">
            ওয়েবসাইটের শীর্ষ লাল ব্রেকিং টিকারে প্রদর্শিত হবে
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Article selection dropdown */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              প্রকাশিত সংবাদ নির্বাচন করুন
            </label>
            <select
              value={selectedArticleId}
              onChange={(e) => setSelectedArticleId(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">-- সংবাদ নির্বাচন করুন (ঐচ্ছিক) --</option>
              {articles.map((art) => (
                <option key={art.id} value={art.id}>
                  [{art.category_name}] {art.headline}
                </option>
              ))}
            </select>
          </div>

          {/* Custom title override */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              জরুরি শিরোনাম (টিকার টেক্সট) <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="সংক্ষিপ্ত জরুরি ব্রেকিং শিরোনাম..."
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="text-xs h-9 focus-visible:ring-red-500"
            />
          </div>

          {/* Custom url */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              কাস্টম লিংক/URL (ঐচ্ছিক)
            </label>
            <Input
              type="text"
              placeholder="/news/... অথবা https://..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="text-xs h-9 focus-visible:ring-red-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-1">
          <p className="text-[11px] text-slate-500">
            তালিকার শীর্ষে যুক্ত হবে। যোগ করার পর নিচের তীরচিহ্ন বোতাম দিয়ে ক্রম সাজাতে পারবেন।
          </p>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 px-4 gap-1.5 shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            ব্রেকিং তালিকায় যোগ করুন
          </Button>
        </div>
      </form>

      {/* Active Breaking List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-slate-800">
              সক্রিয় ব্রেকিং নিউজ তালিকা ({items.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            ▲ / ▼ বোতাম চেপে অগ্রাধিকার ক্রম (Priority) পরিবর্তন করুন
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              এখনো কোনো সংবাদ ব্রেকিং নিউজ তালিকায় যুক্ত করা হয়নি।
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
                        disabled={isFirst || isPending}
                        title="উপরে স্থানান্তর করুন"
                        className="p-1 rounded text-slate-600 hover:text-red-700 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold font-mono text-slate-600 px-1 select-none">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={isLast || isPending}
                        title="নিচে স্থানান্তর করুন"
                        className="p-1 rounded text-slate-600 hover:text-red-700 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
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
                            {item.is_active ? "টিকারে সক্রিয়" : "লুকানো"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id, item.is_active)}
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
                      onClick={() => handleRemove(item.id)}
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
    </div>
  );
}

