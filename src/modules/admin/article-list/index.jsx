import React from "react";
import { getAllArticles, getArticleStatusCounts } from "@/repositories/articleRepository";
import { getDynamicCategories } from "@/repositories/categoryRepository";
import { ArticleListHeader } from "./components/ArticleListHeader";
import { ArticleListTable } from "./components/ArticleListTable";
import { isLowerRole } from "@/config/roles";

export default async function ArticleListModule({ currentUser }) {
  const isLower = isLowerRole(currentUser?.role);

  let articles = [];
  let statusCounts = { all: 0, published: 0, draft: 0, archived: 0, pending: 0, rejected: 0 };
  let categories = [];

  try {
    const filterOptions = isLower
      ? { authorId: currentUser?.id, createdBy: currentUser?.username, limit: 100 }
      : { limit: 100 };

    const countOptions = isLower
      ? { authorId: currentUser?.id, createdBy: currentUser?.username }
      : {};

    const [arts, sc, cats] = await Promise.all([
      getAllArticles(filterOptions),
      getArticleStatusCounts(countOptions),
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
      <ArticleListHeader
        totalCount={statusCounts.all}
        isLowerRole={isLower}
        currentUser={currentUser}
      />
      <ArticleListTable
        initialArticles={articles}
        statusCounts={statusCounts}
        categories={categories}
        currentUser={currentUser}
        isLowerRole={isLower}
      />
    </div>
  );
}
