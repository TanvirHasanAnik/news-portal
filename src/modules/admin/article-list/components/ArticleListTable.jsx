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
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatTimeAgo } from "@/utils/dateUtils";
import { usePermissions } from "@/contexts/AuthContext";

export function ArticleListTable({
  initialArticles = [],
  statusCounts = {},
  categories = [],
  canApprove: propCanApprove,
  canArchive: propCanArchive,
  canDelete: propCanDelete,
  canManageCuration: propCanManageCuration,
}) {
  const { can } = usePermissions();

  const canApprove = propCanApprove !== undefined ? propCanApprove : can("article:approve");
  const canArchive = propCanArchive !== undefined ? propCanArchive : can("article:archive");
  const canDelete = propCanDelete !== undefined ? propCanDelete : can("article:delete");
  const canManageCuration =
    propCanManageCuration !== undefined ? propCanManageCuration : can("curation:manage");

  const [articles, setArticles] = useState(initialArticles);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

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

  const executeStatusChange = (articleId, newStatus) => {
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

  const handleStatusChange = (articleId, newStatus, headline) => {
    if (newStatus === "archived") {
      setConfirmConfig({
        message: `আপনি কি "${headline || "এই সংবাদটি"}" আর্কাইভ করতে চান?`,
        confirmVariant: "destructive",
        onConfirm: () => {
          setConfirmConfig(null);
          executeStatusChange(articleId, newStatus);
        },
      });
      return;
    }
    executeStatusChange(articleId, newStatus);
  };

  const handleToggleFlag = (articleId, flagName) => {
    if (!canManageCuration) return;

    startTransition(async () => {
      const res = await toggleArticleFlagAction(articleId, flagName);
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === articleId ? { ...a, [flagName]: res.active ? 1 : 0 } : a
          )
        );
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const handleDelete = (articleId, headline) => {
    if (!canDelete) return;

    setConfirmConfig({
      message: `আপনি কি নিশ্চিতভাবে "${headline || "এই সংবাদটি"}" স্থায়ীভাবে মুছে ফেলতে চান? এটি আর পুনরুদ্ধার করা যাবে না।`,
      confirmVariant: "destructive",
      onConfirm: () => {
        setConfirmConfig(null);
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
      },
    });
  };

  const openRevisions = (art) => {
    setRevisionModal({
      isOpen: true,
      articleTitle: art.headline,
      revisions: art.revisions || [],
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
          <button onClick={() => setFeedback(null)} className="cursor-pointer">×</button>
        </div>
      )}

      {/* 1. Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
        <button
          onClick={() => setSelectedStatus("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "all"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          সবগুলো ({articles.length})
        </button>
        <button
          onClick={() => setSelectedStatus("pending")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "pending"
              ? "bg-white text-amber-700 shadow-2xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          অপেক্ষমাণ ({statusCounts.pending || 0})
        </button>
        <button
          onClick={() => setSelectedStatus("published")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "published"
              ? "bg-white text-emerald-700 shadow-2xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          প্রকাশিত ({statusCounts.published || 0})
        </button>
        <button
          onClick={() => setSelectedStatus("draft")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "draft"
              ? "bg-white text-slate-700 shadow-2xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          খসড়া ({statusCounts.draft || 0})
        </button>
        <button
          onClick={() => setSelectedStatus("archived")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "archived"
              ? "bg-white text-rose-700 shadow-2xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          আর্কাইভ ({statusCounts.archived || 0})
        </button>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="শিরোনাম বা প্রতিবেদকের নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 w-full sm:w-auto cursor-pointer"
        >
          <option value="all">সকল ক্যাটাগরি</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Articles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                <th className="py-3 px-4">সংবাদের শিরোনাম</th>
                <th className="py-3 px-3">ক্যাটাগরি</th>
                <th className="py-3 px-3">বিশেষ ফ্ল্যাগ</th>
                <th className="py-3 px-3">প্রতিবেদক ও ভিউ</th>
                <th className="py-3 px-3 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    কোনো সংবাদ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => {
                  return (
                    <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Headline & Status */}
                      <td className="py-3 px-4 max-w-md">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin?tab=create-article&editId=${art.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {art.headline}
                          </Link>
                          {art.status === "pending" ? (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0 px-1.5 shrink-0">
                              অপেক্ষমাণ
                            </Badge>
                          ) : art.status === "draft" ? (
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] py-0 px-1.5 shrink-0">
                              খসড়া
                            </Badge>
                          ) : art.status === "archived" ? (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] py-0 px-1.5 shrink-0">
                              আর্কাইভ
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 px-1.5 shrink-0">
                              প্রকাশিত
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                          <span>{formatTimeAgo(art.published_at || art.created_at)}</span>
                          {art.subcategory_name && (
                            <span>• {art.subcategory_name}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => openRevisions(art)}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            <History className="w-3 h-3" />
                            রিভিশন ইতিহাস
                          </button>
                        </div>
                      </td>

                      {/* 2. Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {art.category_name}
                        </span>
                      </td>

                      {/* 3. Special Flags (Breaking / Handpicked) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            title="জরুরি সংবাদ (Breaking)"
                            disabled={!canManageCuration || isPending}
                            onClick={() => handleToggleFlag(art.id, "is_breaking")}
                            className={`p-1.5 rounded border transition-colors cursor-pointer ${
                              art.is_breaking
                                ? "bg-red-50 text-red-600 border-red-200 font-bold"
                                : "text-slate-300 hover:text-slate-500 border-slate-200"
                            } ${!canManageCuration ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="বাছাইকৃত (Handpicked)"
                            disabled={!canManageCuration || isPending}
                            onClick={() => handleToggleFlag(art.id, "is_handpicked")}
                            className={`p-1.5 rounded border transition-colors cursor-pointer ${
                              art.is_handpicked
                                ? "bg-amber-50 text-amber-600 border-amber-200 font-bold"
                                : "text-slate-300 hover:text-slate-500 border-slate-200"
                            } ${!canManageCuration ? "opacity-60 cursor-not-allowed" : ""}`}
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
                          {/* Approve Button (if pending or draft and user has permission) */}
                          {art.status !== "published" && canApprove && (
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

                          {/* Archive Button (if published and user has permission) */}
                          {art.status === "published" && canArchive && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(art.id, "archived", art.headline)}
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

                          {/* Delete (if user has permission) */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(art.id, art.headline)}
                              title="মুছে ফেলুন"
                              disabled={isPending}
                              className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Re-confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmConfig)}
        onClose={() => setConfirmConfig(null)}
        onConfirm={confirmConfig?.onConfirm}
        message={confirmConfig?.message}
        confirmVariant={confirmConfig?.confirmVariant || "default"}
      />
    </div>
  );
}
