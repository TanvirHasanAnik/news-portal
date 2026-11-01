"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle2,
  XCircle,
  Bell,
  CheckCheck,
  ExternalLink,
  ClipboardList,
  Search,
  Clock,
  Send,
  ShieldAlert,
  Users,
  FolderTree,
  Share2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatStaticDateTime } from "@/utils/dateUtils";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/actions/notificationActions";

export function NotificationManager({
  initialNotifications = [],
  currentUser,
  currentPage = 1,
  pageSize = 20,
  totalCount = 0,
  initialFilter = "all",
  initialSearchQuery = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearUnreadNotifications, canAccessTab } = useAuth();

  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    clearUnreadNotifications?.();
  }, [clearUnreadNotifications]);

  const updateUrlParams = (filterVal, searchVal) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("page", "1");
    if (!filterVal || filterVal === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filterVal);
    }
    if (!searchVal || !searchVal.trim()) {
      params.delete("q");
    } else {
      params.set("q", searchVal.trim());
    }
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    updateUrlParams(newFilter, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams(filter, searchQuery);
  };

  const handleMarkAsRead = (id) => {
    startTransition(async () => {
      await markNotificationAsReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      router.refresh();
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      router.refresh();
    });
  };

  const getNotificationIcon = (type) => {
    if (type.includes("approved")) {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      );
    }
    if (type.includes("rejected")) {
      return (
        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
          <XCircle className="w-4 h-4 text-rose-600" />
        </div>
      );
    }
    if (type.includes("submitted") || type.includes("submission")) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Send className="w-4 h-4 text-amber-600" />
        </div>
      );
    }
    if (type.startsWith("admin_")) {
      return (
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4 text-blue-600" />
      </div>
    );
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            সকল
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("articles")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "articles"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            সংবাদ সংক্রান্ত
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("requests")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "requests"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            প্রশাসনিক আবেদন
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "unread"
                ? "bg-white text-blue-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            অপঠিত
          </button>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1 text-slate-500" />
            সবগুলো পঠিত করুন
          </Button>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="নোটিফিকেশন খুঁজুন (Enter চাপুন)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs h-9 bg-white"
        />
      </form>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">কোনো নোটিফিকেশন নেই</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            সংবাদ বা প্রশাসনিক কার্যক্রম সম্পর্কিত নোটিফিকেশন এখানে প্রদর্শিত হবে।
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => {
              const isArticle = notif.type?.startsWith("article_");
              const isRequest = notif.type?.startsWith("request_");
              const isApproved = notif.type?.includes("approved");
              const isRejected = notif.type?.includes("rejected");
              const isSubmission = notif.type?.includes("submitted");

              return (
                <div
                  key={notif.id}
                  className={`p-4 transition-colors ${
                    notif.is_read ? "bg-white hover:bg-slate-50/70" : "bg-blue-50/40 hover:bg-blue-50/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notif.type)}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {notif.title}
                          </h4>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                          {isApproved && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 px-1.5 font-medium">
                              অনুমোদিত
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] py-0 px-1.5 font-medium">
                              প্রত্যাখ্যাত
                            </Badge>
                          )}
                          {isSubmission && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0 px-1.5 font-medium">
                              নতুন জমাকৃত
                            </Badge>
                          )}
                          {notif.type?.startsWith("admin_") && (
                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] py-0 px-1.5 font-medium">
                              প্রশাসনিক
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatStaticDateTime(notif.created_at)}
                          </span>
                          {notif.action_by && (
                            <span>কর্তৃপক্ষ: @{notif.action_by}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isArticle && isApproved && notif.target_slug && (
                        <Link
                          href={`/article/${notif.target_slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                        >
                          সংবাদটি দেখুন <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      {isRequest && canAccessTab?.("requests") && (
                        <Link
                          href="/admin?tab=requests"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                        >
                          <ClipboardList className="w-3 h-3" /> আবেদন দেখুন
                        </Link>
                      )}

                      {notif.target_type === "user" && canAccessTab?.("users") && (
                        <Link
                          href="/admin?tab=users"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                        >
                          <Users className="w-3 h-3" /> সদস্য তালিকা
                        </Link>
                      )}

                      {(notif.target_type === "category" || notif.target_type === "subcategory" || notif.target_type === "categories") && canAccessTab?.("categories") && (
                        <Link
                          href="/admin?tab=categories"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                        >
                          <FolderTree className="w-3 h-3" /> ক্যাটাগরি
                        </Link>
                      )}

                      {notif.target_type === "social_links" && canAccessTab?.("social-links") && (
                        <Link
                          href="/admin?tab=social-links"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                        >
                          <Share2 className="w-3 h-3" /> সোশ্যাল লিংক
                        </Link>
                      )}

                      {notif.target_type === "curated_news" && canAccessTab?.("curation") && (
                        <Link
                          href="/admin?tab=curation"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                        >
                          <Sparkles className="w-3 h-3" /> কিউরেশন
                        </Link>
                      )}

                      {!notif.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notif.id)}
                          title="পঠিত হিসেবে চিহ্নিত করুন"
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            pageParamName="page"
          />
        </div>
      )}
    </div>
  );
}
