"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  CheckCircle2,
  Archive,
  Trash2,
  History,
  Zap,
  BookmarkCheck,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateArticleStatusAction,
  toggleArticleFlagAction,
  deleteArticleAction,
} from "@/actions/articleActions";
import { ArticleRevisionsDialog } from "./ArticleRevisionsDialog";
import { formatTimeAgo } from "@/utils/dateUtils";

export function ArticleListTable({ initialArticles = [], statusCounts = {}, categories = [] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);

  // Revision modal state
  const [revisionModal, setRevisionModal] = useState({
    isOpen: false,
    articleTitle: "",
    revisions: [],
  });

  // Filtered articles
  const filteredArticles = articles.filter((art) => {
    // Status filter
    if (selectedStatus !== "all" && art.status !== selectedStatus) {
      return false;
    }
    // Category filter
    if (selectedCategory !== "all" && art.category_slug !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHeadline = art.headline?.toLowerCase().includes(q);
      const matchAuthor = art.author_name?.toLowerCase().includes(q);
      if (!matchHeadline && !matchAuthor) return false;
    }
    return true;
  });

  const handleStatusChange = (articleId, newStatus) => {
    startTransition(async () => {
      const res = await updateArticleStatusAction(articleId, newStatus);
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === articleId ? { ...a, status: newStatus } : a))
        );
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleToggleFlag = (articleId, flagName) => {
    startTransition(async () => {
      const res = await toggleArticleFlagAction(articleId, flagName);
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === articleId ? { ...a, [flagName]: res.active ? 1 : 0 } : a
          )
        );
      }
    });
  };

  const handleDelete = (articleId, headline) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${headline}" সংবাদটি মুছে ফেলতে চান?`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteArticleAction(articleId);
      if (res.success) {
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <Badge variant="success">প্রকাশিত</Badge>;
      case "pending_approval":
        return <Badge variant="warning">অনুমোদনের অপেক্ষায়</Badge>;
      case "draft":
        return <Badge variant="secondary">খসড়া</Badge>;
      case "archived":
        return <Badge variant="outline">আর্কাইভকৃত</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
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
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
      )}

      {/* Controls & Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Status Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {[
            { id: "all", label: "সকল", count: statusCounts.all || articles.length },
            { id: "published", label: "প্রকাশিত", count: statusCounts.published || 0 },
            {
              id: "pending_approval",
              label: "অনুমোদনের অপেক্ষায়",
              count: statusCounts.pending_approval || 0,
            },
            { id: "draft", label: "খসড়া", count: statusCounts.draft || 0 },
            { id: "archived", label: "আর্কাইভকৃত", count: statusCounts.archived || 0 },
          ].map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="শিরোনাম বা প্রতিবেদক দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50/50"
            />
          </div>

          <div className="w-full sm:w-56 shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">সংবাদ শিরোনাম ও বিভাগ</th>
                <th className="py-3 px-3">অবস্থা</th>
                <th className="py-3 px-3">হাইলাইটস</th>
                <th className="py-3 px-3">প্রতিবেদক</th>
                <th className="py-3 px-3 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    কোনো সংবাদ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => {
                  return (
                    <tr key={art.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* 1. Headline, Category, Time */}
                      <td className="py-3 px-4 max-w-md">
                        <div className="flex items-start gap-3">
                          {art.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={art.image}
                              alt=""
                              className="w-12 h-10 object-cover rounded-md border border-slate-200 shrink-0 mt-0.5"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 line-clamp-2 text-xs sm:text-sm">
                              {art.headline}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                              <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                {art.category_name}
                              </span>
                              {art.subcategory_name && (
                                <>
                                  <span>•</span>
                                  <span>{art.subcategory_name}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{formatTimeAgo(art.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Status Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(art.status)}
                      </td>

                      {/* 3. Toggles: Breaking & Lead */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            title="জরুরি সংবাদ (Breaking)"
                            onClick={() => handleToggleFlag(art.id, "is_breaking")}
                            className={`p-1.5 rounded border transition-colors cursor-pointer ${
                              art.is_breaking
                                ? "bg-red-50 text-red-600 border-red-200 font-bold"
                                : "text-slate-300 hover:text-slate-500 border-slate-200"
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="বাছাইকৃত (Handpicked)"
                            onClick={() => handleToggleFlag(art.id, "is_handpicked")}
                            className={`p-1.5 rounded border transition-colors cursor-pointer ${
                              art.is_handpicked
                                ? "bg-amber-50 text-amber-600 border-amber-200 font-bold"
                                : "text-slate-300 hover:text-slate-500 border-slate-200"
                            }`}
                          >
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* 4. Author & Views */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="font-medium text-slate-800 text-xs">{art.author_name || "প্রতিবেদক"}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {(art.view_count || 0).toLocaleString("bn-BD")} ভিউ
                        </p>
                      </td>

                      {/* 5. Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Button (if pending or draft) */}
                          {art.status !== "published" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(art.id, "published")}
                              title="অনুমোদন ও প্রকাশ করুন"
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              অনুমোদন
                            </button>
                          )}

                          {/* Archive Button (if published) */}
                          {art.status === "published" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(art.id, "archived")}
                              title="আর্কাইভ করুন"
                              disabled={isPending}
                              className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Live preview link */}
                          <Link
                            href={`/article/${art.slug || art.id}`}
                            target="_blank"
                            title="ওয়েবসাইটে দেখুন"
                            className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(art.id, art.headline)}
                            title="মুছে ফেলুন"
                            disabled={isPending}
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revision Modal */}
      <ArticleRevisionsDialog
        isOpen={revisionModal.isOpen}
        onClose={() => setRevisionModal({ isOpen: false, articleTitle: "", revisions: [] })}
        articleTitle={revisionModal.articleTitle}
        revisions={revisionModal.revisions}
      />
    </div>
  );
}

