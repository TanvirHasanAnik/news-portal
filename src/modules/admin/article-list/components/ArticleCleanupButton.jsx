"use client";

import React, { useState } from "react";
import { Trash2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { cleanupArticlesAction } from "@/actions/maintenanceActions";

export function ArticleCleanupButton({ currentUser }) {
  const isSuperAdminOrAdmin = ["super_admin", "admin"].includes(currentUser?.role);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    message: "",
  });

  if (!isSuperAdminOrAdmin) {
    return null;
  }

  const handleConfirm = async () => {
    setIsCleaning(true);
    try {
      const res = await cleanupArticlesAction();
      setIsModalOpen(false);
      setFeedbackModal({
        isOpen: true,
        message: res.message || "সংবাদ পরিচ্ছন্নকরণ প্রক্রিয়া সম্পন্ন হয়েছে।",
      });
    } catch (_err) {
      setIsModalOpen(false);
      setFeedbackModal({
        isOpen: true,
        message: "অনাকাঙ্ক্ষিত ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        disabled={isCleaning}
        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 text-sm font-medium cursor-pointer gap-1.5 shadow-xs"
      >
        {isCleaning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            পরিচ্ছন্ন হচ্ছে...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            মেয়াদোত্তীর্ণ সংবাদ পরিচ্ছন্নকরণ
          </>
        )}
      </Button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
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

      <AlertModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ isOpen: false, message: "" })}
        message={feedbackModal.message}
      />
    </>
  );
}
