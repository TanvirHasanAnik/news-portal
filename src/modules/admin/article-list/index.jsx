import React from "react";
import { getAllArticles, getArticleStatusCounts } from "@/repositories/articleRepository";
import { getDynamicCategories } from "@/repositories/categoryRepository";
import { ArticleListHeader } from "./components/ArticleListHeader";
import { ArticleListTable } from "./components/ArticleListTable";

export default async function ArticleListModule() {
  let articles = [];
  let statusCounts = { all: 0, published: 0, draft: 0, archived: 0, pending: 0 };
  let categories = [];

  try {
    const [arts, sc, cats] = await Promise.all([
      getAllArticles({ limit: 50 }),
      getArticleStatusCounts(),
      getDynamicCategories(),
    ]);
    articles = arts || [];
    statusCounts = sc || statusCounts;
    categories = cats || [];
  } catch (err) {
    console.error("[ArticleListModule error]:", err);
  }

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
