"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { History, Search, ExternalLink, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatStaticDateTime } from "@/utils/dateUtils";
import { AdminPagination } from "@/components/admin/AdminPagination";

export function ArticleAuditLogsSection({
  logs = [],
  currentPage = 1,
  pageSize = 20,
  totalCount = 0,
  selectedAction: initialAction = "all",
  searchQuery: initialSearch = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedAction, setSelectedAction] = useState(initialAction);

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setSelectedAction(initialAction);
  }, [initialAction]);

  const updateLogUrl = (actionVal, searchVal) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("logPage", "1");
    if (!actionVal || actionVal === "all") {
      params.delete("logAction");
    } else {
      params.set("logAction", actionVal);
    }
    if (!searchVal || !searchVal.trim()) {
      params.delete("logQ");
    } else {
      params.set("logQ", searchVal.trim());
    }
    router.push(`?${params.toString()}`);
  };

  const handleActionChange = (newAction) => {
    setSelectedAction(newAction);
    updateLogUrl(newAction, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateLogUrl(selectedAction, searchQuery);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "create_article":
        return {
          label: "সংবাদ তৈরি",
          color: "text-emerald-700 bg-emerald-50 border border-emerald-200",
        };
      case "edit_article":
        return {
          label: "সংবাদ সম্পাদনা",
          color: "text-blue-700 bg-blue-50 border border-blue-200",
        };
      case "update_status":
        return {
          label: "অবস্থা পরিবর্তন",
          color: "text-amber-700 bg-amber-50 border border-amber-200",
        };
      case "delete_article":
        return {
          label: "সংবাদ মুছে ফেলা",
          color: "text-rose-700 bg-rose-50 border border-rose-200",
        };
      default:
        return {
          label: action,
          color: "text-slate-600 bg-slate-50 border border-slate-200",
        };
    }
  };

  const getDetailsSummary = (log) => {
    if (!log.details) return "আর্টিকেল সংক্রান্ত কার্যক্রম";
    try {
      const parsed = typeof log.details === "string" ? JSON.parse(log.details) : log.details;

      if (log.action === "update_status") {
        const statusMap = {
          published: "প্রকাশিত",
          pending: "পর্যালোচনার অপেক্ষায়",
          draft: "খসড়া",
          rejected: "প্রত্যাখ্যাত",
          archived: "আর্কাইভকৃত",
        };
        const st = statusMap[parsed.status] || parsed.status;
        return `নতুন অবস্থা: ${st}`;
      }

      if (log.action === "create_article") {
        const st = parsed.status === "published" ? "সরাসরি প্রকাশিত" : "খসড়া সংরক্ষিত";
        return `সংবাদ তৈরি (${st})`;
      }

      if (log.action === "edit_article") {
        return "কনটেন্ট বা মেটাডেটা হালনাগাদ";
      }

      if (log.action === "delete_article") {
        return "আর্টিকেল স্থায়ীভাবে মুছে ফেলা হয়েছে";
      }

      if (parsed.status) {
        return `অবস্থা: ${parsed.status}`;
      }

      return "আর্টিকেল আপডেট সম্পন্ন";
    } catch {
      return log.details;
    }
  };

  const getArticleHeadline = (log) => {
    if (log.article_headline) return log.article_headline;
    if (log.details) {
      try {
        const parsed = typeof log.details === "string" ? JSON.parse(log.details) : log.details;
        if (parsed.headline) return parsed.headline;
      } catch {}
    }
    return "সংবাদ নিবন্ধ";
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-800" />
            <h2 className="text-base font-bold text-slate-900">আর্টিকেল অডিট ট্রেইল</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            সংবাদ তৈরি, সম্পাদনা, প্রকাশনা ও অবস্থা পরিবর্তনের ইতিহাস
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg w-fit">
          <ShieldCheck className="w-4 h-4" />
          সম্পাদনা ট্র্যাকিং
        </div>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="শিরোনাম বা সম্পাদকের ইউজারনেম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-white"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => handleActionChange(e.target.value)}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 w-full sm:w-auto cursor-pointer"
        >
          <option value="all">সকল কার্যক্রম</option>
          <option value="create_article">সংবাদ তৈরি</option>
          <option value="edit_article">সংবাদ সম্পাদনা</option>
          <option value="update_status">অবস্থা পরিবর্তন</option>
          <option value="delete_article">সংবাদ মুছে ফেলা</option>
        </select>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">অ্যাকশন</th>
              <th className="py-3 px-3">সংবাদের শিরোনাম</th>
              <th className="py-3 px-3">সম্পাদক / ব্যবহারকারী</th>
              <th className="py-3 px-3">বিবরণ</th>
              <th className="py-3 px-4 text-right">ঘটনার সময়</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400">
                  কোনো আর্টিকেল অডিট রেকর্ড পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const badge = getActionBadge(log.action);
                const headline = getArticleHeadline(log);
                const isDeleted = log.action === "delete_article";

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 line-clamp-1" title={headline}>
                          {headline}
                        </span>
                        {!isDeleted && log.target_id && (
                          <Link
                            href={`/admin?tab=create-article&editId=${log.target_id}`}
                            title="আর্টিকেল সম্পাদনা করুন"
                            className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-900">
                      @{log.user_name || "admin"}
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {getDetailsSummary(log)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {formatStaticDateTime(log.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        pageParamName="logPage"
      />
    </div>
  );
}
