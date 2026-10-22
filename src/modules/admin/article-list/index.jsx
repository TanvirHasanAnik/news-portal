import React from "react";
import { getAllArticles, getArticleStatusCounts } from "@/repositories/articleRepository";
import { getAllCategories } from "@/repositories/categoryRepository";
import { ArticleListHeader } from "./components/ArticleListHeader";
import { ArticleListTable } from "./components/ArticleListTable";

export default async function ArticleListModule() {
  const [articles, statusCounts, categories] = await Promise.all([
    getAllArticles({ limit: 50 }),
    getArticleStatusCounts(),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-6">
      <ArticleListHeader totalCount={statusCounts.all} />
      <ArticleListTable
        initialArticles={articles}
        statusCounts={statusCounts}
        categories={categories}
      />
    </div>
  );
}

