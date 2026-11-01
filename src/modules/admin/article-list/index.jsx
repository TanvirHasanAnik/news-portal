import React from "react";
import {
  getAllArticles,
  getAllArticlesCount,
  getArticleStatusCounts,
  getArticleAuditLogs,
  getArticleAuditLogsCount,
} from "@/repositories/articleRepository";
import { getDynamicCategories } from "@/repositories/categoryRepository";
import { ArticleListHeader } from "./components/ArticleListHeader";
import { ArticleListTable } from "./components/ArticleListTable";
import { isLowerRole } from "@/config/roles";

export default async function ArticleListModule({ currentUser, searchParams }) {
  const isLower = isLowerRole(currentUser?.role);
  const isSubEditor = currentUser?.role === "sub_editor";
  const isReporter = currentUser?.role === "reporter";

  const resolvedParams = searchParams ? await searchParams : {};
  const page = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
  const status = resolvedParams?.status || "all";
  const category = resolvedParams?.category || "all";
  const search = resolvedParams?.q || "";
  const defaultView = isSubEditor ? "reporters" : "all";
  const view = resolvedParams?.view || defaultView;
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const logPage = Math.max(1, parseInt(resolvedParams?.logPage || "1", 10));
  const logAction = resolvedParams?.logAction || "all";
  const logSearch = resolvedParams?.logQ || "";
  const logPageSize = 20;
  const logOffset = (logPage - 1) * logPageSize;

  let articles = [];
  let totalArticlesCount = 0;
  let statusCounts = { all: 0, published: 0, draft: 0, archived: 0, pending: 0, rejected: 0 };
  let categories = [];
  let auditLogs = [];
  let totalAuditLogsCount = 0;

  try {
    const articleQueryOptions = {
      authorId: currentUser?.id,
      createdBy: currentUser?.username,
      forSubEditor: isSubEditor,
      isReporter,
      isLower,
      activeView: view,
      status,
      categorySlug: category,
      search,
      limit: pageSize,
      offset,
    };

    const countOptions = isLower
      ? { authorId: currentUser?.id, createdBy: currentUser?.username }
      : {};

    const logQueryOptions = {
      action: logAction,
      search: logSearch,
      limit: logPageSize,
      offset: logOffset,
    };

    const [arts, totalArts, sc, cats, alogs, totalLogs] = await Promise.all([
      getAllArticles(articleQueryOptions),
      getAllArticlesCount(articleQueryOptions),
      getArticleStatusCounts(countOptions),
      getDynamicCategories(),
      !isLower ? getArticleAuditLogs(logQueryOptions) : Promise.resolve([]),
      !isLower ? getArticleAuditLogsCount(logQueryOptions) : Promise.resolve(0),
    ]);

    articles = arts || [];
    totalArticlesCount = totalArts || 0;
    statusCounts = sc || statusCounts;
    categories = cats || [];
    auditLogs = alogs || [];
    totalAuditLogsCount = totalLogs || 0;
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
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalArticlesCount}
        initialActiveView={view}
        initialSelectedStatus={status}
        initialSelectedCategory={category}
        initialSearchQuery={search}
        auditCurrentPage={logPage}
        auditPageSize={logPageSize}
        auditTotalCount={totalAuditLogsCount}
        auditSelectedAction={logAction}
        auditSearchQuery={logSearch}
      />
    </div>
  );
}
