"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle2,
  XCircle,
  Bell,
  CheckCheck,
  ExternalLink,
  Edit,
  ClipboardList,
  Search,
  Clock,
  Sparkles,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatStaticDateTime } from "@/utils/dateUtils";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/actions/notificationActions";

export function NotificationManager({ initialNotifications = [], currentUser }) {
  const { clearUnreadNotifications } = useAuth();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    clearUnreadNotifications?.();
  }, [clearUnreadNotifications]);

  const counts = useMemo(() => {
    return {
      all: notifications.length,
      articles: notifications.filter((n) => n.type.startsWith("article_")).length,
      requests: notifications.filter((n) => n.type.startsWith("request_")).length,
      unread: notifications.filter((n) => !n.is_read).length,
    };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {

      if (filter === "unread" && n.is_read) return false;
      if (filter === "articles" && !n.type.startsWith("article_")) return false;
      if (filter === "requests" && !n.type.startsWith("request_")) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (n.title || "").toLowerCase().includes(q);
        const msgMatch = (n.message || "").toLowerCase().includes(q);
        return titleMatch || msgMatch;
      }

      return true;
    });
  }, [notifications, filter, searchQuery]);

  const handleMarkAsRead = (id) => {
    startTransition(async () => {
      await markNotificationAsReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
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
    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4 text-blue-600" />
      </div>
    );
  };

  return (
    <div className="space-y-4">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            সকল ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter("articles")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "articles"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            সংবাদ সংক্রান্ত ({counts.articles})
          </button>
          <button
            type="button"
            onClick={() => setFilter("requests")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "requests"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            প্রশাসনিক আবেদন ({counts.requests})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "unread"
                ? "bg-white text-blue-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            অপঠিত ({counts.unread})
          </button>
        </div>

        {counts.unread > 0 && (
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

      <div className="relative w-full max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="নোটিফিকেশন খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs h-9 bg-white"
        />
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">কোনো নোটিফিকেশন পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400">
            {filter === "unread"
              ? "আপনার কোনো অপঠিত নোটিফিকেশন নেই।"
              : "আপনার অ্যাকাউন্টে নতুন কোনো আপডেট নেই।"}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((notif) => {
            const isApproved = notif.type.includes("approved");
            const isRejected = notif.type.includes("rejected");
            const isSubmission = notif.type.includes("submitted") || notif.type.includes("submission");
            const isArticle = notif.target_type === "article";
            const isRequest = notif.target_type === "request";

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${
                  notif.is_read
                    ? "bg-white border-slate-200"
                    : "bg-blue-50/40 border-blue-200 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {getNotificationIcon(notif.type)}

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                          {notif.title}
                        </h3>
                        {!notif.is_read && (
                          <Badge className="bg-blue-600 text-white text-[10px] py-0 px-1.5">
                            নতুন
                          </Badge>
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

                    {isArticle && (
                      isApproved && notif.target_slug ? (
                        <Link
                          href={`/article/${notif.target_slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                        >
                          সংবাদটি দেখুন <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link
                          href={`/admin?tab=create-article&editId=${notif.target_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                        >
                          <Edit className="w-3 h-3" /> সংশোধন করুন
                        </Link>
                      )
                    )}

                    {isRequest && (
                      <Link
                        href="/admin?tab=requests"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                      >
                        <ClipboardList className="w-3 h-3" /> আবেদন দেখুন
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
      )}
    </div>
  );
}

