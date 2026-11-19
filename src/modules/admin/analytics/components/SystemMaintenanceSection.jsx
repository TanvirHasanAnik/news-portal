"use client";

import React, { useState } from "react";
import { Trash2, RotateCcw, ShieldAlert, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { cleanupArticlesAction, revalidateAllCachesAction } from "@/actions/maintenanceActions";

export function SystemMaintenanceSection({ currentUser }) {
  const isSuperAdminOrAdmin = ["super_admin", "admin"].includes(currentUser?.role);

  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [isCacheModalOpen, setIsCacheModalOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);

  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    message: "",
  });

  if (!isSuperAdminOrAdmin) {
    return null;
  }

  const handleConfirmCleanup = async () => {
    setIsCleaning(true);
    try {
      const res = await cleanupArticlesAction();
      setIsCleanupModalOpen(false);
      setFeedbackModal({
        isOpen: true,
        message: res.message || "সংবাদ পরিচ্ছন্নকরণ প্রক্রিয়া সম্পন্ন হয়েছে।",
      });
    } catch (_err) {
      setIsCleanupModalOpen(false);
      setFeedbackModal({
        isOpen: true,
        message: "অনাকাঙ্ক্ষিত ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const handleConfirmRevalidate = async () => {
    setIsRevalidating(true);
    try {
      const res = await revalidateAllCachesAction();
      setIsCacheModalOpen(false);
      setFeedbackModal({
        isOpen: true,
        message: res.message || "ক্যাশ পুনর্নবীকরণ সফলভাবে সম্পন্ন হয়েছে।",
      });
    } catch (_err) {
      setIsCacheModalOpen(false);
      setFeedbackModal({
        isOpen: true,
        message: "ক্যাশ পুনর্নবীকরণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      });
    } finally {
      setIsRevalidating(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                সিস্টেম ও ডেটাবেজ রক্ষণাবেক্ষণ
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                মেয়াদোত্তীর্ণ সংবাদ পরিচ্ছন্নকরণ এবং ওয়েবসাইটের ক্যাশ তাৎক্ষণিক পুনর্নবীকরণের প্রশাসনিক ব্যবস্থা।
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col justify-between p-4.5 rounded-xl border border-rose-100 bg-rose-50/20 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-rose-700">
                <Trash2 className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold">মেয়াদোত্তীর্ণ সংবাদ পরিচ্ছন্নকরণ</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                অনলাইন ডেস্কের ৩০ দিনের পুরোনো অপ্রয়োজনীয় সংবাদ ও সংশ্লিষ্ট মিডিয়া ফাইল স্থায়ীভাবে মুছে ফেলে ডেটাবেজ সুরক্ষিত ও হালকা রাখুন। ন্যূনতম ১০টি সাম্প্রতিক সংবাদ সর্বদা সুরক্ষিত থাকবে।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-rose-100/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">সাপ্তাহিক স্বয়ংক্রিয় সূচি সক্রিয়</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCleanupModalOpen(true)}
                disabled={isCleaning}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 text-xs font-semibold cursor-pointer gap-1.5"
              >
                {isCleaning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    পরিচ্ছন্ন হচ্ছে...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    এখনই পরিচ্ছন্ন করুন
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-col justify-between p-4.5 rounded-xl border border-sky-100 bg-sky-50/20 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sky-700">
                <RotateCcw className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold">ওয়েবসাইট ক্যাশ পুনর্নবীকরণ</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                হোমপেজ, ক্যাটাগরি ও সকল প্রকাশিত সংবাদের স্ট্যাটিক ক্যাশ পুনর্নবীকরণ করুন। যেকোনো আকস্মিক পরিবর্তনের পর পাঠকদের কাছে দ্রুততম সময়ে তা দৃশ্যমান রাখতে এটি কার্যকর।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-sky-100/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">তাৎক্ষণিক বিশ্বব্যাপী আপডেট</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCacheModalOpen(true)}
                disabled={isRevalidating}
                className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800 text-xs font-semibold cursor-pointer gap-1.5"
              >
                {isRevalidating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    পুনর্নবীকরণ হচ্ছে...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    ক্যাশ রিফ্রেশ করুন
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isCleanupModalOpen}
        onClose={() => setIsCleanupModalOpen(false)}
        onConfirm={handleConfirmCleanup}
        confirmText="হ্যাঁ, পরিচ্ছন্ন করুন"
        cancelText="বাতিল"
        confirmVariant="danger"
        isLoading={isCleaning}
        maxWidth="max-w-md"
      >
        <div className="flex items-start gap-3 pt-1">
          <div className="p-2 rounded-full bg-rose-100 text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              মেয়াদোত্তীর্ণ সংবাদ পরিচ্ছন্নকরণ নিশ্চিতকরণ
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              আপনি কি নিশ্চিত যে ৩০ দিনের পুরোনো অনলাইন ডেস্ক সংবাদ এবং সংশ্লিষ্ট মিডিয়া ফাইলগুলো মুছে ফেলতে চান? পোর্টাল সচল রাখতে সাম্প্রতিক ১০টি সংবাদ কোনো অবস্থাতেই মোছা হবে না।
            </p>
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={isCacheModalOpen}
        onClose={() => setIsCacheModalOpen(false)}
        onConfirm={handleConfirmRevalidate}
        confirmText="হ্যাঁ, পুনর্নবীকরণ করুন"
        cancelText="বাতিল"
        confirmVariant="default"
        isLoading={isRevalidating}
        maxWidth="max-w-md"
      >
        <div className="flex items-start gap-3 pt-1">
          <div className="p-2 rounded-full bg-sky-100 text-sky-600 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              ওয়েবসাইট ক্যাশ পুনর্নবীকরণ নিশ্চিতকরণ
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              আপনি কি ওয়েবসাইটের সকল পৃষ্ঠার স্ট্যাটিক ক্যাশ পুনর্নবীকরণ করতে চান? এর ফলে সকল পাঠকদের জন্য ওয়েবসাইট সরাসরি সর্বশেষ তথ্যে আপডেট হয়ে যাবে।
            </p>
          </div>
        </div>
      </ConfirmModal>

      <AlertModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ isOpen: false, message: "" })}
        message={feedbackModal.message}
      />
    </>
  );
}
