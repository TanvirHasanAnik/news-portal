"use client";

import React from "react";
import { X, History, User, Clock } from "lucide-react";
import { formatTimeAgo } from "@/utils/dateUtils";

export function ArticleRevisionsDialog({ isOpen, onClose, revisions = [], articleTitle = "", isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">রিভিশন ও কনটেন্ট ইতিহাস</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{articleTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              ইতিহাস লোড করা হচ্ছে...
            </div>
          ) : revisions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              এই আর্টিকেলের কোনো পূর্ববর্তী রিভিশন সংরক্ষিত নেই।
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {revisions.map((rev, idx) => (
                <div key={rev.id || idx} className="relative group">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white" />
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rev.editor_name || (rev.editor_username ? `@${rev.editor_username}` : "সম্পাদক")}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(rev.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 mb-1">{rev.headline}</p>
                    <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100">
                      {rev.change_summary || "সাধারণ পরিবর্তন সংরক্ষিত হয়েছে"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

