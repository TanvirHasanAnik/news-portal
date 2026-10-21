import React from "react";
import { CheckCircle2 } from "lucide-react";
import { getAllCategoriesWithSubcategories } from "@/repositories/categoryRepository";
import { getRecentArticles } from "@/repositories/articleRepository";
import ArticleCreateForm from "@/components/admin/ArticleCreateForm";
import RecentArticlesList from "@/components/admin/RecentArticlesList";
import { Badge } from "@/components/ui/badge";

/**
 * Single-Purpose Module: Article Creation
 * Self-contained Server Component that fetches its own required data
 * and renders the article creation interface and recent articles list.
 */
export default async function ArticleCreateModule() {
  // Fetch only the data required by this specific module
  const [categoriesWithSubs, recentArticles] = await Promise.all([
    getAllCategoriesWithSubcategories(),
    getRecentArticles(5),
  ]);

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif-bangla">
              নতুন আর্টিকেল তৈরি করুন
            </h1>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
              Article Creation Module
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            সার্ভার অ্যাকশন এবং ক্লাউডফ্লেয়ার D1 (SQLite) রিপোজিটরির মাধ্যমে সরাসরি ডাটাবেজে সংবাদ যুক্ত করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="gap-1 py-1 px-3">
            <CheckCircle2 className="w-3.5 h-3.5" /> D1 Database Ready
          </Badge>
        </div>
      </div>

      {/* Article Creation Form (Client Component via Server Action) */}
      <ArticleCreateForm categories={categoriesWithSubs} />

      {/* Live Recent Articles List */}
      <div className="pt-4">
        <RecentArticlesList articles={recentArticles} />
      </div>
    </div>
  );
}

