"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Archive,
  Trash2,
  Zap,
  BookmarkCheck,
  Send,
  Edit,
  RotateCcw,
  FileText,
  User,
  History,
  MessageSquareQuote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateArticleStatusAction,
  passArticleToUpperAction,
  toggleArticleFlagAction,
  deleteArticleAction,
} from "@/actions/articleActions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatTimeAgo, formatStaticDateTime } from "@/utils/dateUtils";
import { useAuth, usePermissions } from "@/contexts/AuthContext";
import { isLowerRole as checkIsLowerRole } from "@/config/roles";
import { ArticleAuditLogsSection } from "./ArticleAuditLogsSection";

export function ArticleListTable({
  initialArticles = [],
  statusCounts = {},
  categories = [],
  currentUser = null,
  isLowerRole = false,
  auditLogs = [],
  canApprove: propCanApprove,
  canArchive: propCanArchive,
  canDelete: propCanDelete,
  canManageCuration: propCanManageCuration,
}) {
  const { can } = usePermissions();
  const { setPendingArticlesCount } = useAuth();

  const isLower = isLowerRole || checkIsLowerRole(currentUser?.role);
  const isSubEditor = currentUser?.role === "sub_editor";
  const isReporter = currentUser?.role === "reporter";
  const isUpper = !isLower;

  const canApprove = propCanApprove !== undefined ? propCanApprove : can("article:approve");
  const canArchive = propCanArchive !== undefined ? propCanArchive : can("article:archive");
  const canDelete = propCanDelete !== undefined ? propCanDelete : can("article:delete");
  const canManageCuration =
    propCanManageCuration !== undefined ? propCanManageCuration : can("curation:manage");

  const [articles, setArticles] = useState(initialArticles);

  const [activeView, setActiveView] = useState(() => (currentUser?.role === "sub_editor" ? "reporters" : "all"));
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [rejectModalConfig, setRejectModalConfig] = useState(null);
  const [viewingReasonArticle, setViewingReasonArticle] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState("");

  const isOwnArticle = (art) => {
    if (!currentUser) return false;
    return (
      art.author_id === currentUser.id ||
      art.created_by === currentUser.username ||
      art.authorName === currentUser.fullName ||
      art.authorName === currentUser.name
    );
  };

  const scopedArticles = useMemo(() => {
    if (isReporter) {

      return articles.filter(isOwnArticle);
    }
    if (isSubEditor) {
      if (activeView === "reporters") {

        return articles.filter((art) => !isOwnArticle(art));
      }
      return articles.filter(isOwnArticle);
    }
    if (activeView === "my") {
      return articles.filter((art) => isOwnArticle(art) && art.status !== "rejected");
    }

    return articles.filter((art) => art.status !== "draft");
  }, [articles, isReporter, isSubEditor, activeView, currentUser]);

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

  const filteredArticles = useMemo(() => {
    return scopedArticles.filter((art) => {

      if (selectedStatus !== "all") {
        const artSt = art.status === "pending_approval" ? "pending" : art.status;
        if (artSt !== selectedStatus) return false;
      }

      if (selectedCategory !== "all" && art.category_slug !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchHeadline = art.headline?.toLowerCase().includes(q);
        const matchAuthor = (art.author_name || art.created_by)?.toLowerCase().includes(q);
        if (!matchHeadline && !matchAuthor) return false;
      }
      return true;
    });
  }, [scopedArticles, selectedStatus, selectedCategory, searchQuery]);

  const executeStatusChange = (articleId, newStatus, rejectionReason = null) => {
    startTransition(async () => {
      const prevArt = articles.find((a) => a.id === articleId);
      const res = await updateArticleStatusAction(articleId, newStatus, rejectionReason);
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === articleId
              ? {
                  ...a,
                  status: newStatus,
                  rejection_reason: newStatus === "rejected" ? rejectionReason : null,
                  rejectionReason: newStatus === "rejected" ? rejectionReason : null,
                  published_at:
                    newStatus === "published"
                      ? a.published_at || new Date().toISOString()
                      : a.published_at,
                }
              : a
          )
        );

        const wasPending = prevArt?.status === "pending" || prevArt?.status === "pending_approval";
        const isNowPending = newStatus === "pending" || newStatus === "pending_approval";
        if (wasPending && !isNowPending) {
          setPendingArticlesCount?.((c) => Math.max(0, c - 1));
        } else if (!wasPending && isNowPending) {
          setPendingArticlesCount?.((c) => c + 1);
        }

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
      setRejectionReasonText("");
      setRejectModalConfig({ articleId, headline });
      return;
    }

    executeStatusChange(articleId, newStatus);
  };

  const handlePassForward = (articleId, headline) => {
    setConfirmConfig({
      message: `আপনি কি "${headline || "এই সংবাদটি"}" যাচাই করে ঊর্ধ্বতন কর্তৃপক্ষের অনুমোদনের জন্য পাঠাতে চান?`,
      confirmVariant: "default",
      onConfirm: () => {
        setConfirmConfig(null);
        startTransition(async () => {
          const res = await passArticleToUpperAction(articleId);
          if (res.success) {
            setArticles((prev) =>
              prev.map((a) =>
                a.id === articleId
                  ? {
                      ...a,
                      is_passed_to_upper: 1,
                      passed_by: currentUser?.username || "sub_editor",
                      passed_at: new Date().toISOString(),
                    }
                  : a
              )
            );
            setFeedback({
              type: "success",
              message: "সংবাদটি সফলভাবে যাচাই করে ঊর্ধ্বতন কর্তৃপক্ষের কাছে পাঠানো হয়েছে।",
            });
          } else {
            setFeedback({ type: "error", message: res.message });
          }
          setTimeout(() => setFeedback(null), 4000);
        });
      },
    });
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

  return (
    <div className="space-y-6">

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
            সকল আর্টিকেল ({articles.filter((art) => art.status !== "draft").length})
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
            আমার আর্টিকেল ({articles.filter((art) => isOwnArticle(art) && art.status !== "rejected").length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView("audit");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === "audit"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            আর্টিকেল অডিট ({auditLogs.length})
          </button>
        </div>
      )}

      {isSubEditor && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => {
              setActiveView("reporters");
              setSelectedStatus("all");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === "reporters"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Send className="w-3.5 h-3.5 text-blue-500" />
            প্রতিবেদকদের জমাকৃত সংবাদ ({articles.filter((art) => !isOwnArticle(art)).length})
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

      {activeView === "audit" && !isLower ? (
        <ArticleAuditLogsSection logs={auditLogs} />
      ) : (
        <>

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

        {isLower ? (
          isSubEditor && activeView === "reporters" ? (

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
          ) : (

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
          )
        ) : activeView === "all" ? (

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
        ) : (

          <>
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
                  const canEdit =
                    !isLower ||
                    (isAuthor && status !== "published") ||
                    (isSubEditor && !isAuthor && (status === "pending" || art.status === "pending_approval"));

                  return (
                    <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">

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
                            <div className="inline-flex items-center gap-1.5 shrink-0">
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] py-0 px-1.5 shrink-0">
                              প্রত্যাখ্যাত
                            </Badge>
                            {Boolean(art.rejection_reason || art.rejectionReason) && (
                              <button
                                type="button"
                                onClick={() => setViewingReasonArticle(art)}
                                title="প্রত্যাখ্যানের পূর্ণ মন্তব্য দেখতে ক্লিক করুন"
                                className="inline-flex items-center gap-1 text-[10px] text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 transition-colors font-semibold cursor-pointer"
                              >
                                <MessageSquareQuote className="w-3 h-3 text-rose-500" />
                                কারণ দেখুন
                              </button>
                            )}
                          </div>
                          ) : status === "archived" ? (
                            <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] py-0 px-1.5 shrink-0">
                              আর্কাইভ
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 px-1.5 shrink-0">
                              প্রকাশিত
                            </Badge>
                          )}

                          {Boolean(art.is_passed_to_upper) && (
                            <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px] py-0 px-1.5 shrink-0 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-teal-600" />
                              সহ-সম্পাদক কর্তৃক পরীক্ষিত {art.passed_by ? `(@${art.passed_by})` : ""}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span>{formatTimeAgo(art.published_at || art.created_at)}</span>
                          {art.subcategory_name && <span>• {art.subcategory_name}</span>}
                        </div>

                        {status === "rejected" && Boolean(art.rejection_reason || art.rejectionReason) && (
                          <div className="mt-1.5 flex items-center">
                            <button
                              type="button"
                              onClick={() => setViewingReasonArticle(art)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/70 text-[11px] text-rose-800 transition-colors cursor-pointer max-w-lg text-left group"
                              title="সম্পূর্ণ মন্তব্য পড়তে ক্লিক করুন"
                            >
                              <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                              <span className="font-semibold text-rose-950 shrink-0 text-[11px]">কারণ:</span>
                              <span className="truncate text-rose-800/90 font-normal text-[11px]">
                                {art.rejection_reason || art.rejectionReason}
                              </span>
                              <span className="text-[10px] text-rose-600 font-semibold underline shrink-0 ml-1 group-hover:text-rose-950">
                                বিস্তারিত
                              </span>
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {art.category_name}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <span className="text-slate-400 font-normal">তৈরি:</span>
                            <span className="font-semibold text-slate-800">
                              @{art.created_by || "reporter"}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              ({formatStaticDateTime(art.created_at)})
                            </span>
                          </div>
                          {art.last_edited_by && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span className="text-slate-400 font-normal">সর্বশেষ সম্পাদনা:</span>
                              <span className="font-medium text-slate-700">
                                @{art.last_edited_by}
                              </span>
                              <span className="text-slate-400">
                                ({formatStaticDateTime(art.last_edited_at || art.updated_at)})
                              </span>
                            </div>
                          )}
                          {Boolean(art.is_passed_to_upper) && (
                            <div className="flex items-center gap-1.5 text-[11px] text-teal-700 font-medium">
                              <span className="text-teal-600 font-normal">সহ-সম্পাদক যাচাই:</span>
                              <span className="font-semibold text-teal-800">
                                @{art.passed_by || "sub_editor"}
                              </span>
                              {art.passed_at && (
                                <span className="text-teal-600/80 text-[10px]">
                                  ({formatStaticDateTime(art.passed_at)})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

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

                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">

                          {!isLower ? (
                            <>

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

                              {(status === "pending" || art.status === "pending_approval") && canApprove && !isAuthor && (
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

                            <>

                              {isSubEditor && !isAuthor && (status === "pending" || art.status === "pending_approval") && (
                                art.is_passed_to_upper ? (
                                  <span
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold cursor-default select-none"
                                    title={`ইতিমধ্যে @${art.passed_by || "সহ-সম্পাদক"} কর্তৃক ঊর্ধ্বতনদের কাছে পাঠানো হয়েছে`}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    প্রেরিত
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handlePassForward(art.id, art.headline)}
                                    title="যাচাই করে ঊর্ধ্বতনদের কাছে পাঠান"
                                    disabled={isPending}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    পাস করুন
                                  </button>
                                )
                              )}

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

                          {canEdit && (
                            <Link
                              href={`/admin?tab=create-article&editId=${art.id}`}
                              title={isSubEditor && !isAuthor ? "যাচাই ও সম্পাদনা করুন" : "সম্পাদনা করুন"}
                              className="p-1.5 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                          )}

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

                          {((canDelete && isUpper) || (isAuthor && status === "draft")) && (
                            <button
                              type="button"
                              onClick={() => handleDelete(art.id, art.headline)}
                              title="স্থায়ীভাবে মুছে ফেলুন"
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
      </>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmConfig)}
        onClose={() => setConfirmConfig(null)}
        onConfirm={confirmConfig?.onConfirm}
        message={confirmConfig?.message}
        confirmVariant={confirmConfig?.confirmVariant || "default"}
      />

      <ConfirmModal
        isOpen={Boolean(rejectModalConfig)}
        onClose={() => {
          setRejectModalConfig(null);
          setRejectionReasonText("");
        }}
        onConfirm={() => {
          if (!rejectModalConfig) return;
          const { articleId } = rejectModalConfig;
          const reason = rejectionReasonText.trim() || null;
          setRejectModalConfig(null);
          setRejectionReasonText("");
          executeStatusChange(articleId, "rejected", reason);
        }}
        message={`আপনি কি নিশ্চিতভাবে "${rejectModalConfig?.headline || "এই সংবাদটি"}" প্রত্যাখ্যান করতে চান?`}
        confirmText="প্রত্যাখ্যান নিশ্চিত করুন"
        cancelText="বাতিল"
        confirmVariant="destructive"
      >
        <div className="space-y-1.5 pt-1 text-left">
          <label className="block text-xs font-semibold text-slate-700">
            প্রত্যাখ্যানের কারণ বা মন্তব্য (ঐচ্ছিক):
          </label>
          <textarea
            value={rejectionReasonText}
            onChange={(e) => setRejectionReasonText(e.target.value)}
            placeholder="প্রত্যাখ্যানের কারণ লিখুন (ঐচ্ছিক)..."
            rows={3}
            className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
          />
          <p className="text-[11px] text-slate-400">
            প্রতিবেদক ও যাচাইকারী সহ-সম্পাদক এই মন্তব্যটি দেখতে পাবেন।
          </p>
        </div>
      </ConfirmModal>
    
      {viewingReasonArticle && (
        <ConfirmModal
          isOpen={Boolean(viewingReasonArticle)}
          onClose={() => setViewingReasonArticle(null)}
          onConfirm={() => setViewingReasonArticle(null)}
          confirmText="বন্ধ করুন"
          cancelText=""
          maxWidth="max-w-md"
        >
          <div className="space-y-3.5 pt-1 text-left">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  প্রত্যাখ্যানের পর্যালোচনা ও কারণ
                </h4>
                <p className="text-[11px] text-slate-400">
                  কর্তৃপক্ষের প্রেরিত নির্দেশনা
                </p>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                সংবাদের শিরোনাম:
              </span>
              <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                {viewingReasonArticle.headline}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-rose-800 block mb-1">
                মন্তব্য / নির্দেশনা:
              </span>
              <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200/80 text-xs text-rose-950 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                {viewingReasonArticle.rejection_reason || viewingReasonArticle.rejectionReason}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              উক্ত মন্তব্য অনুযায়ী সংবাদটি সংশোধন করে পুনরায় পর্যালোচনার জন্য জমা দেওয়া যাবে।
            </p>
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}