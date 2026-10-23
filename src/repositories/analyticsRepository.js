import { getDb, query, queryOne, withTransaction } from "@/lib/db";
import { getMostReadArticles } from "./articleRepository";

/**
 * Analytics Repository
 * Raw MySQL (mysql2/promise) data layer for Cloudflare Workers (workerd) & TiDB.
 * Handles authentic manual view counting, category traffic aggregates, top pages, and audit logs.
 */

export async function getAnalyticsSummary() {
  const today = new Date().toISOString().slice(0, 10);

  const [totalViewsRes, todayViewsRes, articlesCountRes, usersCountRes] =
    await Promise.all([
      queryOne("SELECT COALESCE(SUM(view_count), 0) as total FROM articles"),
      queryOne("SELECT COUNT(*) as count FROM analytics_page_views WHERE viewed_date = ?", [today]),
      queryOne("SELECT COUNT(*) as count FROM articles"),
      queryOne("SELECT COUNT(*) as count FROM users"),
    ]);

  return {
    totalViews: Number(totalViewsRes?.total) || 0,
    todayViews: Number(todayViewsRes?.count) || 0,
    totalArticles: Number(articlesCountRes?.count) || 0,
    totalUsers: Number(usersCountRes?.count) || 0,
  };
}

/**
 * Returns views and article counts for dynamic content categories
 * (Permanent categories 'latest' and 'handpicked' are excluded from dynamic category breakdown)
 */
export async function getCategoryViewsStats() {
  const rows = await query(
    `SELECT c.name as category_name, 
            c.slug as category_slug, 
            COUNT(a.id) as article_count, 
            COALESCE(SUM(a.view_count), 0) as total_views 
     FROM categories c 
     LEFT JOIN articles a ON a.category_slug = c.slug 
     WHERE c.is_permanent = 0 AND c.slug NOT IN ('latest', 'handpicked')
     GROUP BY c.id, c.name, c.slug, c.sort_order 
     ORDER BY total_views DESC, c.sort_order ASC`
  );

  return rows || [];
}

/**
 * Top articles wrapper delegating to reusable getMostReadArticles function
 */
export async function getTopArticles(limit = 10) {
  return await getMostReadArticles(limit);
}

/**
 * Records an authentic article page view in the database with atomic transaction
 */
export async function recordArticleView(articleId, { categorySlug = "", subcategoryName = "", path = "" } = {}) {
  if (!articleId) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const id = `pv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await withTransaction(async (tx) => {
      // 1. Increment article total view_count
      await tx.query(
        "UPDATE articles SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?",
        [articleId]
      );

      // 2. Insert into analytics_page_views for date & category tracking
      await tx.query(
        `INSERT INTO analytics_page_views (id, path, article_id, category_slug, subcategory_name, viewed_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [id, path || `/article/${articleId}`, articleId, categorySlug || null, subcategoryName || null, today]
      );
    });
  } catch (err) {
    console.error("recordArticleView error:", err);
  }
}

export async function getRecentAuditLogs(limit = 15) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 15), 100);
  const rows = await query(
    `SELECT l.*, u.name as user_name, u.email as user_email, u.role as user_role
     FROM audit_logs l
     LEFT JOIN users u ON l.user_id = u.id
     ORDER BY l.created_at DESC
     LIMIT ?`,
    [safeLimit]
  );
  return rows || [];
}

export async function recordAuditLog({
  userId = "usr_superadmin",
  action,
  targetType,
  targetId = null,
  details = null,
}) {
  const id = `log_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const detailsStr = typeof details === "object" ? JSON.stringify(details) : details;

  await query(
    `INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, created_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [id, userId, action, targetType, targetId, detailsStr]
  );

  return { id };
}
