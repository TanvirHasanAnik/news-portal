import React from "react";
import { getAllArticles, getArticleStatusCounts, getArticleAuditLogs } from "@/repositories/articleRepository";
import { getDynamicCategories } from "@/repositories/categoryRepository";
import { ArticleListHeader } from "./components/ArticleListHeader";
import { ArticleListTable } from "./components/ArticleListTable";
import { isLowerRole } from "@/config/roles";

export default async function ArticleListModule({ currentUser }) {
  const isLower = isLowerRole(currentUser?.role);
  const isSubEditor = currentUser?.role === "sub_editor";

  let articles = [];
  let statusCounts = { all: 0, published: 0, draft: 0, archived: 0, pending: 0, rejected: 0 };
  let categories = [];
  let auditLogs = [];

  try {
    const filterOptions = isSubEditor
      ? { authorId: currentUser?.id, createdBy: currentUser?.username, forSubEditor: true, limit: 100 }
      : isLower
      ? { authorId: currentUser?.id, createdBy: currentUser?.username, limit: 100 }
      : { limit: 100 };

    const countOptions = isLower
      ? { authorId: currentUser?.id, createdBy: currentUser?.username }
      : {};

    const [arts, sc, cats, alogs] = await Promise.all([
      getAllArticles(filterOptions),
      getArticleStatusCounts(countOptions),
      getDynamicCategories(),
      !isLower ? getArticleAuditLogs(100) : Promise.resolve([]),
    ]);

    articles = arts || [];
    statusCounts = sc || statusCounts;
    categories = cats || [];
    auditLogs = alogs || [];
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
        auditLogs={auditLogs}
      />
    </div>
  );
}
