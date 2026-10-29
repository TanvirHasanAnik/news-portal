"use client";

import React from "react";
import { Send, RefreshCw, FileText, XCircle, Save, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ArticleFormSubmit({
  isPending,
  isEditing = false,
  isLowerRole = false,
  isSubEditorReview = false,
  currentStatus = "published",
  onSaveSubEditorEdit,
  onPassToUpper,
  onSaveDraft,
  onReject,
  onReset,
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 space-y-2.5">

        {isEditing ? (
          isSubEditorReview ? (

            <div className="space-y-2">
              <Button
                type="button"
                onClick={onPassToUpper}
                disabled={isPending}
                className="w-full text-sm sm:text-base font-bold shadow-md bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> পাঠানো হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> যাচাই করে ঊর্ধ্বতনদের কাছে পাঠান
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={onSaveSubEditorEdit}
                disabled={isPending}
                variant="outline"
                className="w-full text-xs sm:text-sm font-semibold border-slate-300 bg-white text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2 text-slate-600" /> সম্পাদনা সংরক্ষণ করুন (তালিকায় থাকবে)
              </Button>
            </div>
          ) : (

            <Button
              type="submit"
              variant="success"
              size="lg"
              disabled={isPending}
              className="w-full text-sm sm:text-base font-bold shadow-md bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> সংরক্ষণ করা হচ্ছে...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> সংবাদ আপডেট করুন
                </>
              )}
            </Button>
          )
        ) : isLowerRole ? (

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
                <Send className="w-4 h-4 mr-2" /> সংবাদ প্রকাশ করুন
              </>
            )}
          </Button>
        )}

        {!isEditing && onSaveDraft && (
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
        )}

        {!isLowerRole && isEditing && onReject && (currentStatus === "pending" || currentStatus === "pending_approval") && (
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

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isPending}
          className="w-full text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          {isEditing ? "পরিবর্তন বাতিল করুন" : "ফর্ম রিসেট করুন"}
        </Button>
      </CardContent>
    </Card>
  );
}
