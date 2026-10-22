"use client";

import React, { useState, useTransition } from "react";
import { BookmarkCheck, Zap, Star, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addCuratedNewsAction,
  removeCuratedNewsAction,
  toggleCuratedNewsAction,
} from "@/actions/curationActions";

export function CurationTabsManager({ initialItems = [], articles = [] }) {
  const [activeTab, setActiveTab] = useState("handpicked"); // handpicked | breaking | lead
  const [items, setItems] = useState(initialItems);
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [priority, setPriority] = useState("0");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);

  const filteredItems = items.filter((item) => item.type === activeTab);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedArticleId && !customTitle.trim()) {
      alert("অনুগ্রহ করে একটি আর্টিকেল নির্বাচন করুন অথবা শিরোনাম লিখুন।");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("type", activeTab);
      formData.append("articleId", selectedArticleId);
      formData.append("customTitle", customTitle.trim());
      formData.append("priority", priority);

      const res = await addCuratedNewsAction(null, formData);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        const selectedArt = articles.find((a) => a.id === selectedArticleId);
        setItems((prev) => [
          {
            id: `temp_${Date.now()}`,
            type: activeTab,
            article_id: selectedArticleId,
            article_headline: selectedArt?.headline || customTitle,
            category_name: selectedArt?.category_name || "বিশেষ",
            custom_title: customTitle,
            priority: parseInt(priority, 10),
            is_active: 1,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setSelectedArticleId("");
        setCustomTitle("");
        setPriority("0");
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
    if (!confirm("আপনি কি নিশ্চিত যে এই সংবাদটি কিউরেশন তালিকা থেকে বাদ দিতে চান?")) return;
    startTransition(async () => {
      await removeCuratedNewsAction(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setFeedback({ type: "success", message: "তালিকা থেকে সফলভাবে সরানো হয়েছে।" });
      setTimeout(() => setFeedback(null), 3000);
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

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("handpicked")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "handpicked"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>বাছাইকৃত খবর (Handpicked)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("breaking")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "breaking"
              ? "border-red-600 text-red-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>জরুরি ব্রেকিং সংবাদ (Breaking)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("lead")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "lead"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Star className="w-4 h-4" />
          <span>প্রধান খবর (Lead)</span>
        </button>
      </div>

      {/* Add New Curated Item Box */}
      <form
        onSubmit={handleAddItem}
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-slate-600" />
          {activeTab === "handpicked"
            ? "নতুন বাছাইকৃত সংবাদ যুক্ত করুন"
            : activeTab === "breaking"
            ? "নতুন ব্রেকিং নিউজ যুক্ত করুন"
            : "নতুন লিড সংবাদ যুক্ত করুন"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Article selection dropdown */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              সংবাদ নির্বাচন করুন
            </label>
            <select
              value={selectedArticleId}
              onChange={(e) => setSelectedArticleId(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">-- প্রকাশিত সংবাদ নির্বাচন করুন --</option>
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
              বিকল্প/কাস্টম শিরোনাম (ঐচ্ছিক)
            </label>
            <Input
              type="text"
              placeholder="সংক্ষিপ্ত শিরোনাম লিখুন..."
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Priority */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              অগ্রাধিকার (Priority)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9"
          >
            তালিকায় যুক্ত করুন
          </Button>
        </div>
      </form>

      {/* List of active curated items */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            বর্তমানে সক্রিয় তালিকা ({filteredItems.length})
          </span>
          <span className="text-[11px] text-slate-400">অগ্রাধিকার অনুযায়ী স্বয়ংক্রিয় সাজানো</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              এই ক্যাটাগরিতে এখনো কোনো সংবাদ কিউরেশন তালিকায় যুক্ত করা হয়নি।
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    {item.priority || 0}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                      {item.custom_title || item.article_headline || "শিরোনামহীন সংবাদ"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      {item.category_name && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          {item.category_name}
                        </Badge>
                      )}
                      <span>
                        অবস্থা: {item.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </div>
                  </div>
                </div>

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
                    title="বাদ দিন"
                    className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

