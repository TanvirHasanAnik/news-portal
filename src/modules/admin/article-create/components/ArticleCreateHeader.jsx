import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, User, CheckCircle2, FileEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo, formatStaticDateTime } from "@/utils/dateUtils";

export default function ArticleCreateHeader({ initialArticle = null, currentUser = null }) {
  const isEditing = Boolean(initialArticle);
  const isSubEditorReview =
    currentUser?.role === "sub_editor" &&
    initialArticle &&
    initialArticle.created_by !== currentUser?.username;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <Link
              href="/admin?tab=article-list"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="তালিকায় ফিরুন"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif-bangla">
              {isEditing ? "সংবাদ সম্পাদনা" : "নতুন আর্টিকেল তৈরি করুন"}
            </h1>

            {isEditing && (
              <Badge
                variant="outline"
                className={`text-xs capitalize font-medium ${
                  initialArticle.status === "published"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : initialArticle.status === "pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : initialArticle.status === "rejected"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {initialArticle.status === "published"
                  ? "প্রকাশিত"
                  : initialArticle.status === "pending"
                  ? "পর্যালোচনার অপেক্ষায়"
                  : initialArticle.status === "rejected"
                  ? "প্রত্যাখ্যাত"
                  : "খসড়া"}
              </Badge>
            )}

            {isSubEditorReview && (
              <Badge
                variant="outline"
                className="text-xs font-semibold bg-teal-50 text-teal-700 border-teal-200"
              >
                প্রতিবেদকের জমাকৃত সংবাদ পর্যালোচনা
              </Badge>
            )}

            {Boolean(initialArticle?.is_passed_to_upper || initialArticle?.isPassedToUpper) && (
              <Badge
                variant="outline"
                className="text-xs font-semibold bg-teal-50 text-teal-700 border-teal-200 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                সহ-সম্পাদক কর্তৃক পরীক্ষিত {initialArticle.passed_by ? `(@${initialArticle.passed_by})` : ""}
              </Badge>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="text-slate-400">তৈরি:</span>
              <strong className="text-slate-700 font-semibold">
                @{initialArticle.created_by || "reporter"}
              </strong>
              <span className="text-slate-400">
                ({formatStaticDateTime(initialArticle.created_at || initialArticle.createdAt)})
              </span>
            </span>

            {initialArticle.last_edited_by && (
              <span className="flex items-center gap-1">
                <span className="text-slate-400">সর্বশেষ সম্পাদনা:</span>
                <strong className="text-slate-700 font-semibold">
                  @{initialArticle.last_edited_by}
                </strong>
                <span className="text-slate-400">
                  ({formatStaticDateTime(initialArticle.last_edited_at || initialArticle.updated_at || initialArticle.updatedAt)})
                </span>
              </span>
            )}

            {Boolean(initialArticle.is_passed_to_upper || initialArticle.isPassedToUpper) && (
              <span className="flex items-center gap-1 text-teal-700">
                <span className="text-teal-600">সহ-সম্পাদক যাচাই:</span>
                <strong className="text-teal-800 font-semibold">
                  @{initialArticle.passed_by || "sub_editor"}
                </strong>
                {initialArticle.passed_at && (
                  <span className="text-teal-600/80">
                    ({formatStaticDateTime(initialArticle.passed_at)})
                  </span>
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex items-center gap-2">
          <Link
            href="/admin?tab=create-article"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            + নতুন সংবাদ লিখুন
          </Link>
        </div>
      )}
    </div>
  );
}

