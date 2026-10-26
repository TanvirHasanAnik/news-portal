"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Archive,
  Trash2,
  History,
  Zap,
  BookmarkCheck,
  Send,
  Edit,
  RotateCcw,
  FileText,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateArticleStatusAction,
  toggleArticleFlagAction,
  deleteArticleAction,
  getArticleRevisionsAction,
} from "@/actions/articleActions";
import { ArticleRevisionsDialog } from "./ArticleRevisionsDialog";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatTimeAgo } from "@/utils/dateUtils";
import { usePermissions } from "@/contexts/AuthContext";
import { isLowerRole as checkIsLowerRole } from "@/config/roles";

export function ArticleListTable({
  initialArticles = [],
  statusCounts = {},
  categories = [],
  currentUser = null,
  isLowerRole = false,
  canApprove: propCanApprove,
  canArchive: propCanArchive,
  canDelete: propCanDelete,
  canManageCuration: propCanManageCuration,
}) {
  const { can } = usePermissions();

  const isLower = isLowerRole || checkIsLowerRole(currentUser?.role);
  const canApprove = propCanApprove !== undefined ? propCanApprove : can("article:approve");
  const canArchive = propCanArchive !== undefined ? propCanArchive : can("article:archive");
  const canDelete = propCanDelete !== undefined ? propCanDelete : can("article:delete");
  const canManageCuration =
    propCanManageCuration !== undefined ? propCanManageCuration : can("curation:manage");

  const [articles, setArticles] = useState(initialArticles);
  // View mode for Upper Roles: "all" (All Articles) vs "my" (My Articles). Lower roles always "my"
  const [activeView, setActiveView] = useState("all");
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
    isLoading: false,
  });

  // Determine if an article belongs to the current user
  const isOwnArticle = (art) => {
    if (!currentUser) return false;
    return (
      art.author_id === currentUser.id ||
      art.created_by === currentUser.username ||
      art.authorName === currentUser.fullName ||
      art.authorName === currentUser.name
    );
  };

  // Base scope based on upper-role sub-view ("all" vs "my")
  const scopedArticles = useMemo(() => {
    if (isLower) {
      // Lower roles only ever see their own articles
      return articles;
    }
    if (activeView === "my") {
      return articles.filter(isOwnArticle);
    }
    return articles;
  }, [articles, isLower, activeView, currentUser]);

  // Compute live status counts for the currently active scope
  const computedCounts = useMemo(() => {
    const counts = {
      all: scopedArticles.length,
      published: 0,
      draft: 0,
      pending: 0,
      rejected: 0,
      archived: 0,
    };
    scopedArticles.forEach((art) => {
      const st = art.status === "pending_approval" ? "pending" : art.status;
      if (counts[st] !== undefined) {
        counts[st] += 1;
      }
    });
    return counts;
  }, [scopedArticles]);

  // Filtered articles based on selected status, category, and search query
  const filteredArticles = useMemo(() => {
    return scopedArticles.filter((art) => {
      // Status filter
      if (selectedStatus !== "all") {
        const artSt = art.status === "pending_approval" ? "pending" : art.status;
        if (artSt !== selectedStatus) return false;
      }
      // Category filter
      if (selectedCategory !== "all" && art.category_slug !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchHeadline = art.headline?.toLowerCase().includes(q);
        const matchAuthor = (art.author_name || art.created_by)?.toLowerCase().includes(q);
        if (!matchHeadline && !matchAuthor) return false;
      }
      return true;
    });
  }, [scopedArticles, selectedStatus, selectedCategory, searchQuery]);

  const executeStatusChange = (articleId, newStatus) => {
    startTransition(async () => {
      const res = await updateArticleStatusAction(articleId, newStatus);
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === articleId
              ? {
                  ...a,
                  status: newStatus,
                  last_edited_by: currentUser?.username || a.last_edited_by,
                  updated_at: new Date().toISOString(),
                }
              : a
          )
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
        confirmVariant: "default",
        onConfirm: () => {
          setConfirmConfig(null);
          executeStatusChange(articleId, newStatus);
        },
      });
      return;
    }

    if (newStatus === "rejected") {
      setConfirmConfig({
        message: `আপনি কি নিশ্চিতভাবে "${headline || "এই সংবাদটি"}" প্রত্যাখ্যান করতে চান? এটি প্রতিবেদকের কাছে প্রত্যাখ্যাত হিসেবে ফেরত যাবে।`,
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
    if (!canDelete && !isLower) return;

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

  const openRevisions = async (art) => {
    setRevisionModal({
      isOpen: true,
      articleTitle: art.headline,
      revisions: [],
      isLoading: true,
    });

    try {
      const res = await getArticleRevisionsAction(art.id || art.dbId);
      setRevisionModal({
        isOpen: true,
        articleTitle: art.headline,
        revisions: res?.revisions || [],
        isLoading: false,
      });
    } catch (_e) {
      setRevisionModal({
        isOpen: true,
        articleTitle: art.headline,
        revisions: [],
        isLoading: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Upper Roles View Selector ("All Articles" vs "My Articles") */}
      {!isLower && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => {
              setActiveView("all");
              setSelectedStatus("all");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeView === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            সকল আর্টিকেল ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView("my");
              setSelectedStatus("all");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeView === "my"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            আমার আর্টিকেল ({articles.filter(isOwnArticle).length})
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60">
        <button
          type="button"
          onClick={() => setSelectedStatus("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "all"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          সবগুলো ({computedCounts.all || 0})
        </button>

        {/* For Lower Roles: Drafts first, then Pending, Approved, Rejected */}
        {isLower ? (
          <>
            <button
              type="button"
              onClick={() => setSelectedStatus("draft")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === "draft"
                  ? "bg-white text-slate-800 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              খসড়া ({computedCounts.draft || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === "pending"
                  ? "bg-white text-amber-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              পর্যালোচনার অপেক্ষায় ({computedCounts.pending || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("published")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === "published"
                  ? "bg-white text-emerald-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              অনুমোদিত ও প্রকাশিত ({computedCounts.published || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === "rejected"
                  ? "bg-white text-rose-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              প্রত্যাখ্যাত ({computedCounts.rejected || 0})
            </button>
          </>
        ) : (
          /* For Upper Roles: Pending, Published, Draft, Rejected, Archived */
          <>
            <button
              type="button"
              onClick={() => setSelectedStatus("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === "pending"
                  ? "bg-white text-amber-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              পর্যালোচনার অপেক্ষায় ({computedCounts.pending || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("published")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === "published"
                  ? "bg-white text-emerald-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              প্রকাশিত ({computedCounts.published || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("draft")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === "draft"
                  ? "bg-white text-slate-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              খসড়া ({computedCounts.draft || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === "rejected"
                  ? "bg-white text-rose-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              প্রত্যাখ্যাত ({computedCounts.rejected || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("archived")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === "archived"
                  ? "bg-white text-zinc-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              আর্কাইভ ({computedCounts.archived || 0})
            </button>
          </>
        )}
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="শিরোনাম বা সম্পাদকের নাম দিয়ে খুঁজুন..."
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

      {/* Articles Table with Audit Metadata and Clean Consumer-Grade Layout */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                <th className="py-3 px-4">সংবাদের শিরোনাম ও অবস্থা</th>
                <th className="py-3 px-3">ক্যাটাগরি</th>
                <th className="py-3 px-3">অডিট ও ট্র্যাকিং</th>
                <th className="py-3 px-3">ফ্ল্যাগ ও ভিউ</th>
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
                  const status = art.status === "pending_approval" ? "pending" : art.status;
                  const isAuthor = isOwnArticle(art);
                  const canEdit = !isLower || isAuthor;

                  return (
                    <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Headline & State Badge */}
                      <td className="py-3.5 px-4 max-w-sm sm:max-w-md">
                        <div className="flex items-center gap-2 flex-wrap">
                          {canEdit ? (
                            <Link
                              href={`/admin?tab=create-article&editId=${art.id}`}
                              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                              title={art.headline}
                            >
                              {art.headline}
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-900 line-clamp-1" title={art.headline}>
                              {art.headline}
                            </span>
                          )}

                          {status === "pending" ? (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0 px-1.5 shrink-0">
                              পর্যালোচনার অপেক্ষায়
                            </Badge>
                          ) : status === "draft" ? (
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] py-0 px-1.5 shrink-0">
                              খসড়া
                            </Badge>
                          ) : status === "rejected" ? (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] py-0 px-1.5 shrink-0">
                              প্রত্যাখ্যাত
                            </Badge>
                          ) : status === "archived" ? (
                            <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] py-0 px-1.5 shrink-0">
                              আর্কাইভ
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 px-1.5 shrink-0">
                              প্রকাশিত
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span>{formatTimeAgo(art.published_at || art.created_at)}</span>
                          {art.subcategory_name && <span>• {art.subcategory_name}</span>}
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

                      {/* 2. Category & Subcategory */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {art.category_name}
                        </span>
                      </td>

                      {/* 3. Audit Metadata (Requirement 4: created_by and last_edited_by) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <span className="text-slate-400 font-normal">তৈরি:</span>
                            <span className="font-semibold text-slate-800">
                              @{art.created_by || art.author_name || "প্রতিবেদক"}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              ({formatTimeAgo(art.created_at)})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="text-slate-400 font-normal">সর্বশেষ সম্পাদনা:</span>
                            <span className="font-medium text-slate-700">
                              @{art.last_edited_by || art.created_by || art.author_name || "প্রতিবেদক"}
                            </span>
                            <span className="text-slate-400">
                              ({formatTimeAgo(art.updated_at || art.created_at)})
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Flags & Views */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 mb-1">
                          <button
                            type="button"
                            title="জরুরি সংবাদ (Breaking)"
                            disabled={!canManageCuration || isPending}
                            onClick={() => handleToggleFlag(art.id, "is_breaking")}
                            className={`p-1 rounded border transition-colors cursor-pointer ${
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
                            className={`p-1 rounded border transition-colors cursor-pointer ${
                              art.is_handpicked
                                ? "bg-amber-50 text-amber-600 border-amber-200 font-bold"
                                : "text-slate-300 hover:text-slate-500 border-slate-200"
                            } ${!canManageCuration ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {(art.view_count || 0).toLocaleString("bn-BD")} ভিউ
                        </p>
                      </td>

                      {/* 5. Role-Based Actions */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Upper Roles Actions: Approve & Publish, Reject, Archive */}
                          {!isLower ? (
                            <>
                              {/* Approve Button (when pending or draft or rejected) */}
                              {status !== "published" && canApprove && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(art.id, "published", art.headline)}
                                  title="অনুমোদন ও প্রকাশ করুন"
                                  disabled={isPending}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  অনুমোদন
                                </button>
                              )}

                              {/* Reject Button (when pending or published) */}
                              {(status === "pending" || status === "published") && canApprove && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(art.id, "rejected", art.headline)}
                                  title="সংবাদটি প্রত্যাখ্যান করুন"
                                  disabled={isPending}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-medium cursor-pointer transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  প্রত্যাখ্যান
                                </button>
                              )}

                              {/* Archive Button (when published) */}
                              {status === "published" && canArchive && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(art.id, "archived", art.headline)}
                                  title="আর্কাইভ করুন"
                                  disabled={isPending}
                                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            /* Lower Roles (Reporter / Sub-Editor) Actions: Submit for Review, Withdraw */
                            <>
                              {(status === "draft" || status === "rejected") && isAuthor && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(art.id, "pending", art.headline)}
                                  title="পর্যালোচনার জন্য জমা দিন"
                                  disabled={isPending}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  জমা দিন
                                </button>
                              )}

                              {status === "pending" && isAuthor && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(art.id, "draft", art.headline)}
                                  title="খসড়ায় ফিরিয়ে আনুন"
                                  disabled={isPending}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium cursor-pointer transition-colors"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  খসড়ায় ফেরত
                                </button>
                              )}
                            </>
                          )}

                          {/* Edit Button (Upper roles can edit ANY article; Lower roles can edit own) */}
                          {canEdit && (
                            <Link
                              href={`/admin?tab=create-article&editId=${art.id}`}
                              title="সম্পাদনা করুন"
                              className="p-1.5 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Live preview link (when published) */}
                          {status === "published" && (
                            <Link
                              href={`/article/${art.slug || art.id}`}
                              target="_blank"
                              title="ওয়েবসাইটে দেখুন"
                              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Delete (if permitted by role) */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(art.id, art.headline)}
                              title="মুছে ফেলুন"
                              disabled={isPending}
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
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
        onClose={() => setRevisionModal({ isOpen: false, articleTitle: "", revisions: [], isLoading: false })}
        articleTitle={revisionModal.articleTitle}
        revisions={revisionModal.revisions}
        isLoading={revisionModal.isLoading}
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