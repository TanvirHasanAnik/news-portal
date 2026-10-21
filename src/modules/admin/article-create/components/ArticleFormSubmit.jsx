"use client";

import React from "react";
import { Send, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ArticleFormSubmit({ isPending, status, onReset }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 space-y-3">
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
              <Send className="w-4 h-4 mr-2" />{" "}
              {status === "published" ? "সংবাদ প্রকাশ করুন" : "খসড়া সংরক্ষণ করুন"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isPending}
          className="w-full text-slate-500 hover:text-slate-800"
        >
          ফর্ম রিসেট করুন
        </Button>
      </CardContent>
    </Card>
  );
}

