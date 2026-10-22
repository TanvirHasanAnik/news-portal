import { getDb } from "@/lib/db";

/**
 * Curation Repository
 * Manages handpicked, breaking, and lead news collections in curated_news table
 */

export async function getCuratedNews(type) {
  const db = await getDb();
  let sql = `
    SELECT c.*, a.headline as article_headline, a.slug as article_slug, a.category_name, a.image as article_image
    FROM curated_news c
    LEFT JOIN articles a ON c.article_id = a.id
  `;
  const params = [];

  if (type) {
    sql += " WHERE c.type = ?";
    params.push(type);
  }

  sql += " ORDER BY c.priority DESC, c.created_at DESC";

  const { results } = await db.prepare(sql).bind(...params).all();
  return results || [];
}

export async function addCuratedNews({ type, articleId, customTitle = "", customUrl = "", priority = 0 }) {
  const db = await getDb();
  const id = `cur_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  await db
    .prepare(
      `INSERT INTO curated_news (id, type, article_id, custom_title, custom_url, priority, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .bind(id, type, articleId || null, customTitle || null, customUrl || null, Number(priority) || 0)
    .run();

  return { id, type, articleId };
}

export async function removeCuratedNews(id) {
  const db = await getDb();
  return await db.prepare("DELETE FROM curated_news WHERE id = ?").bind(id).run();
}

export async function toggleCuratedNews(id, currentActive) {
  const db = await getDb();
  const newActive = currentActive ? 0 : 1;
  await db
    .prepare("UPDATE curated_news SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(newActive, id)
    .run();
  return { id, is_active: newActive };
}

