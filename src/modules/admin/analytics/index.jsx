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
  const [summary, categoryStats, topArticles, auditLogs] = await Promise.all([
    getAnalyticsSummary(),
    getCategoryViewsStats(),
    getTopArticles(6),
    getRecentAuditLogs(8),
  ]);

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

