"use client";

import React from "react";
import { Send, RefreshCw, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ArticleFormSubmit({
  isPending,
  onSaveDraft,
  onReset,
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 space-y-2.5">
        {/* Publish Action Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="w-full text-base font-bold shadow-md bg-red-600 hover:bg-red-700"
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

        {/* Draft Action Button */}
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={onSaveDraft}
          disabled={isPending}
          className="w-full text-sm font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2 text-slate-500" /> খসড়া হিসেবে সংরক্ষণ
        </Button>

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
