import React from "react";
import Link from "next/link";
import {
  FilePlus2,
  Sparkles,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { getAllCategoriesWithSubcategories } from "@/repositories/categoryRepository";
import { getRecentArticles } from "@/repositories/articleRepository";
import ArticleCreateForm from "@/components/admin/ArticleCreateForm";
import RecentArticlesList from "@/components/admin/RecentArticlesList";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Ensure this page is dynamically rendered so repository queries reflect live data
export const dynamic = "force-dynamic";

/**
 * Admin Panel Page (Server Component)
 * Follows Server Driven Component Architecture:
 * Database (D1/SQLite) <-> Repository Layer <-> Server Component <-> Client Component
 */
export default async function AdminPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams?.tab || "create-article";

  // 1. Fetch live data through Data Access Layer (Repositories) using raw D1 statements
  const [categoriesWithSubs, recentArticles] = await Promise.all([
    getAllCategoriesWithSubcategories(),
    getRecentArticles(5),
  ]);

  return (
    <div className="space-y-8">
      {/* Tab: Article Creation (Primary active tab) */}
      {currentTab === "create-article" && (
        <div className="space-y-8">
          {/* Header section with Shadcn typography & badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif-bangla">
                  নতুন আর্টিকেল তৈরি করুন
                </h1>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                  Article Creation Tab
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

          {/* Article Create Form (Client Component) interacting via Server Action */}
          <ArticleCreateForm categories={categoriesWithSubs} />

          {/* Live Recent Articles List from Server Component */}
          <div className="pt-4">
            <RecentArticlesList articles={recentArticles} />
          </div>
        </div>
      )}

      {/* Feature Preview Tabs from admin_panel_features.md */}
      {currentTab !== "create-article" && (
        <Card className="border-slate-200 shadow-sm max-w-2xl mx-auto my-12 text-center p-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
            <Layers className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="font-mono text-xs">
              Feature Roadmap: {currentTab}
            </Badge>
            <CardTitle className="text-2xl font-bold text-slate-900 font-serif-bangla">
              এই ট্যাবটি পরবর্তী ধাপে উন্মুক্ত হবে
            </CardTitle>
            <CardDescription className="text-sm max-w-md mx-auto leading-relaxed">
              সিস্টেমের প্রাথমিক রিলিজের জন্য বর্তমানে শুধুমাত্র <strong>Article Creation Tab</strong> সম্পূর্ণ কার্যকরী ও ডাটাবেজের সাথে সংযুক্ত করা হয়েছে।
            </CardDescription>
          </div>
          <div className="pt-2">
            <Link href="/admin?tab=create-article">
              <Button variant="default" className="gap-2">
                <FilePlus2 className="w-4 h-4" /> আর্টিকেল তৈরি ট্যাবে ফিরে যান
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

