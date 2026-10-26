"use client";

import React from "react";
import { Send, RefreshCw, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ArticleFormSubmit({
  isPending,
  isEditing = false,
  isLowerRole = false,
  currentStatus = "published",
  onSaveDraft,
  onReject,
  onReset,
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 space-y-2.5">
        {/* Lower Roles Action: Submit for Review */}
        {isLowerRole ? (
          <Button
            type="submit"
            variant="success"
            size="lg"
            disabled={isPending}
            className="w-full text-sm sm:text-base font-bold shadow-md bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> পাঠানো হচ্ছে...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> পর্যালোচনার জন্য জমা দিন
              </>
            )}
          </Button>
        ) : (
          /* Upper Roles Action: Publish Directly or Approve */
          <Button
            type="submit"
            variant="success"
            size="lg"
            disabled={isPending}
            className="w-full text-sm sm:text-base font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> সংরক্ষণ করা হচ্ছে...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isEditing ? "অনুমোদন ও প্রকাশ করুন" : "সংবাদ প্রকাশ করুন"}
              </>
            )}
          </Button>
        )}

        {/* Draft Action Button */}
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={onSaveDraft}
          disabled={isPending}
          className="w-full text-xs sm:text-sm font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2 text-slate-500" /> খসড়া হিসেবে সংরক্ষণ
        </Button>

        {/* Upper Roles: Reject Option for Pending / Published articles */}
        {!isLowerRole && isEditing && onReject && (currentStatus === "pending" || currentStatus === "published") && (
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onReject}
            disabled={isPending}
            className="w-full text-xs sm:text-sm font-semibold border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
          >
            <XCircle className="w-4 h-4 mr-2 text-rose-500" /> সংবাদটি প্রত্যাখ্যান করুন
          </Button>
        )}

        {/* Reset Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isPending}
          className="w-full text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          ফর্ম রিসেট করুন
        </Button>
      </CardContent>
    </Card>
  );
}