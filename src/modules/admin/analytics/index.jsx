import React from "react";
import {
  getAnalyticsSummary,
  getCategoryViewsStats,
  getTopArticles,
  getRecentAuditLogs,
} from "@/repositories/analyticsRepository";
import { AnalyticsHeader } from "./components/AnalyticsHeader";
import { AnalyticsMetricCards } from "./components/AnalyticsMetricCards";
import { CategoryViewsBreakdown } from "./components/CategoryViewsBreakdown";
import { TopArticlesTable } from "./components/TopArticlesTable";
import { AuditLogsTable } from "./components/AuditLogsTable";

export default async function AnalyticsModule() {
  let summary = { totalViews: 0, todayViews: 0, totalArticles: 0, totalUsers: 0 };
  let categoryStats = [];
  let topArticles = [];
  let auditLogs = [];

  try {
    const [s, c, t, a] = await Promise.all([
      getAnalyticsSummary(),
      getCategoryViewsStats(),
      getTopArticles(10),
      getRecentAuditLogs(8),
    ]);
    summary = s || summary;
    categoryStats = c || [];
    topArticles = t || [];
    auditLogs = a || [];
  } catch (err) {
    console.error("[AnalyticsModule error]:", err);
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AnalyticsHeader />

      {/* 2. Key Metrics Row */}
      <AnalyticsMetricCards metrics={summary} />

      {/* 3. Category Breakdown & Top Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryViewsBreakdown categoryStats={categoryStats} />
        <TopArticlesTable articles={topArticles} />
      </div>

      {/* 4. Audit Trail */}
      <AuditLogsTable logs={auditLogs} />
    </div>
  );
}
