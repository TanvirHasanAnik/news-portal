"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ArticleFormFeedback({ result, onReset }) {
  if (!result) return null;

  if (result.success) {
    return (
      <Alert variant="success" className="animate-slide-in">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <AlertTitle className="text-emerald-900 font-bold">
          অভিনন্দন! সফলভাবে সম্পন্ন হয়েছে
        </AlertTitle>
        <AlertDescription className="text-emerald-800 space-y-2 mt-1">
          <p>{result.message}</p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100"
              onClick={onReset}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> নতুন আরেকটি সংবাদ লিখুন
            </Button>
            {result.slug && (
              <Link
                href={`/article/${result.slug}`}
                target="_blank"
                className="inline-flex items-center text-xs font-semibold text-emerald-900 underline hover:text-emerald-700"
              >
                ওয়েবসাইটে দেখুন <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="animate-slide-in">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="font-bold">সংরক্ষণ ব্যর্থ হয়েছে</AlertTitle>
      <AlertDescription className="mt-1">
        <p>{result.message}</p>
        {result.errors && (
          <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
            {Object.values(result.errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}

