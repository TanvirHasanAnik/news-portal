import React from "react";
import {
  getAnalyticsSummary,
  getCategoryViewsStats,
  getTopArticles,
  getRecentAuditLogs,
  getRecentAuditLogsCount,
} from "@/repositories/analyticsRepository";
import { AnalyticsHeader } from "./components/AnalyticsHeader";
import { AnalyticsMetricCards } from "./components/AnalyticsMetricCards";
import { CategoryViewsBreakdown } from "./components/CategoryViewsBreakdown";
import { TopArticlesTable } from "./components/TopArticlesTable";
import { AuditLogsTable } from "./components/AuditLogsTable";

export default async function AnalyticsModule({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const logPage = Math.max(1, parseInt(resolvedParams?.logPage || "1", 10));
  const logPageSize = 20;
  const logOffset = (logPage - 1) * logPageSize;

  let summary = { totalViews: 0, todayViews: 0, totalArticles: 0, totalUsers: 0 };
  let categoryStats = [];
  let topArticles = [];
  let auditLogs = [];
  let totalAuditLogs = 0;

  try {
    const [s, c, t, a, count] = await Promise.all([
      getAnalyticsSummary(),
      getCategoryViewsStats(),
      getTopArticles(10),
      getRecentAuditLogs({ limit: logPageSize, offset: logOffset }),
      getRecentAuditLogsCount(),
    ]);
    summary = s || summary;
    categoryStats = c || [];
    topArticles = t || [];
    auditLogs = a || [];
    totalAuditLogs = count || 0;
  } catch (err) {
    console.error("[AnalyticsModule error]:", err);
  }

  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      <AnalyticsMetricCards metrics={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryViewsBreakdown categoryStats={categoryStats} />
        <TopArticlesTable articles={topArticles} />
      </div>
      <AuditLogsTable
        logs={auditLogs}
        currentPage={logPage}
        pageSize={logPageSize}
        totalCount={totalAuditLogs}
      />
    </div>
  );
}
