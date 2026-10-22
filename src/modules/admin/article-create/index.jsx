import React from "react";
import { getDynamicCategoriesWithSubcategories } from "@/repositories/categoryRepository";
import { getRecentArticles } from "@/repositories/articleRepository";
import {
  ArticleCreateHeader,
  ArticleCreateForm,
  RecentArticlesList,
} from "./components";

/**
 * Single-Purpose Module: Article Creation
 * Self-contained Server Component that fetches its own required data
 * and renders the article creation interface and recent articles list.
 */
export default async function ArticleCreateModule() {
  // Fetch only dynamic content categories (permanent categories 'latest' and 'handpicked' are excluded)
  const [categoriesWithSubs, recentArticles] = await Promise.all([
    getDynamicCategoriesWithSubcategories(),
    getRecentArticles(5),
  ]);

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <ArticleCreateHeader />

      {/* Article Creation Form (Client Component via Server Action) */}
      <ArticleCreateForm categories={categoriesWithSubs} />

      {/* Live Recent Articles List */}
      <div className="pt-4">
        <RecentArticlesList articles={recentArticles} />
      </div>
    </div>
  );
}

