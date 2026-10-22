import { getDb } from "@/lib/db";
import { getMostReadArticles } from "./articleRepository";

/**
 * Analytics Repository
 * Handles authentic manual view counting, category traffic aggregates, top pages, and audit logs
 */

export async function getAnalyticsSummary() {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [totalViewsRes, todayViewsRes, articlesCountRes, usersCountRes] =
    await Promise.all([
      db.prepare("SELECT COALESCE(SUM(view_count), 0) as total FROM articles").first(),
      db.prepare("SELECT COUNT(*) as count FROM analytics_page_views WHERE viewed_date = ?").bind(today).first(),
      db.prepare("SELECT COUNT(*) as count FROM articles").first(),
      db.prepare("SELECT COUNT(*) as count FROM users").first(),
    ]);

  return {
    totalViews: totalViewsRes?.total || 0,
    todayViews: todayViewsRes?.count || 0,
    totalArticles: articlesCountRes?.count || 0,
    totalUsers: usersCountRes?.count || 0,
  };
}

/**
 * Returns views and article counts for dynamic content categories
 * (Permanent categories 'latest' and 'handpicked' are excluded from dynamic category breakdown)
 */
export async function getCategoryViewsStats() {
  const db = await getDb();
  const { results } = await db
    .prepare(
      `SELECT c.name as category_name, 
              c.slug as category_slug, 
              COUNT(a.id) as article_count, 
              COALESCE(SUM(a.view_count), 0) as total_views 
       FROM categories c 
       LEFT JOIN articles a ON a.category_slug = c.slug 
       WHERE c.is_permanent = 0 AND c.slug NOT IN ('latest', 'handpicked')
       GROUP BY c.id 
       ORDER BY total_views DESC, c.sort_order ASC`
    )
    .all();

  return results || [];
}

/**
 * Top articles wrapper delegating to reusable getMostReadArticles function
 */
export async function getTopArticles(limit = 10) {
  return await getMostReadArticles(limit);
}

/**
 * Records an authentic article page view in the database
 */
export async function recordArticleView(articleId, { categorySlug = "", subcategoryName = "", path = "" } = {}) {
  if (!articleId) return;
  try {
    const db = await getDb();
    const today = new Date().toISOString().slice(0, 10);
    const id = `pv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Increment article's total view_count
    await db
      .prepare("UPDATE articles SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?")
      .bind(articleId)
      .run();

    // 2. Insert into analytics_page_views for date & category tracking
    await db
      .prepare(
        `INSERT INTO analytics_page_views (id, path, article_id, category_slug, subcategory_name, viewed_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      )
      .bind(id, path || `/article/${articleId}`, articleId, categorySlug || null, subcategoryName || null, today)
      .run();
  } catch (err) {
    console.error("recordArticleView error:", err);
  }
}

export async function getRecentAuditLogs(limit = 15) {
  const db = await getDb();
  const { results } = await db
    .prepare(
      `SELECT l.*, u.name as user_name, u.email as user_email, u.role as user_role
       FROM audit_logs l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();

  return results || [];
}

export async function recordAuditLog({
  userId = "usr_superadmin",
  action,
  targetType,
  targetId = null,
  details = null,
}) {
  const db = await getDb();
  const id = `log_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const detailsStr = typeof details === "object" ? JSON.stringify(details) : details;

  await db
    .prepare(
      `INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
    .bind(id, userId, action, targetType, targetId, detailsStr)
    .run();

  return { id };
}
