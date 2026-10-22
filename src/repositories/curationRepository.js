import { getDb } from "@/lib/db";
import { mapDbArticleToFrontend } from "./articleRepository";
import { handpickedNewsList } from "@/data/handpickedNewsData";

/**
 * Curation Repository
 * Manages handpicked and breaking news collections in curated_news table
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

export async function addCuratedNews({ type, articleId, customTitle = "", customUrl = "", priority }) {
  const db = await getDb();
  const id = `cur_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  // If no priority specified, place it at the very top (highest priority + 10)
  let resolvedPriority = Number(priority);
  if (isNaN(resolvedPriority) || resolvedPriority === 0) {
    const maxRow = await db
      .prepare("SELECT COALESCE(MAX(priority), 0) as max_p FROM curated_news WHERE type = ?")
      .bind(type)
      .first();
    resolvedPriority = (maxRow?.max_p || 0) + 10;
  }

  await db
    .prepare(
      `INSERT INTO curated_news (id, type, article_id, custom_title, custom_url, priority, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .bind(id, type, articleId || null, customTitle || null, customUrl || null, resolvedPriority)
    .run();

  // Keep articles table flags in sync
  if (articleId) {
    if (type === "handpicked") {
      await db.prepare("UPDATE articles SET is_handpicked = 1 WHERE id = ?").bind(articleId).run();
    } else if (type === "breaking") {
      await db.prepare("UPDATE articles SET is_breaking = 1 WHERE id = ?").bind(articleId).run();
    }
  }

  return { id, type, articleId };
}

export async function removeCuratedNews(id) {
  const db = await getDb();
  const existing = await db.prepare("SELECT * FROM curated_news WHERE id = ?").bind(id).first();

  await db.prepare("DELETE FROM curated_news WHERE id = ?").bind(id).run();

  // If this was an article reference, check if it's still in another active curated entry
  if (existing?.article_id) {
    if (existing.type === "handpicked") {
      const remaining = await db
        .prepare("SELECT COUNT(*) as count FROM curated_news WHERE article_id = ? AND type = 'handpicked'")
        .bind(existing.article_id)
        .first();
      if (!remaining || remaining.count === 0) {
        await db.prepare("UPDATE articles SET is_handpicked = 0 WHERE id = ?").bind(existing.article_id).run();
      }
    } else if (existing.type === "breaking") {
      const remaining = await db
        .prepare("SELECT COUNT(*) as count FROM curated_news WHERE article_id = ? AND type = 'breaking'")
        .bind(existing.article_id)
        .first();
      if (!remaining || remaining.count === 0) {
        await db.prepare("UPDATE articles SET is_breaking = 0 WHERE id = ?").bind(existing.article_id).run();
      }
    }
  }

  return { id };
}

export async function toggleCuratedNews(id, currentActive) {
  const db = await getDb();
  const newActive = currentActive ? 0 : 1;
  await db
    .prepare("UPDATE curated_news SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(newActive, id)
    .run();

  const item = await db.prepare("SELECT * FROM curated_news WHERE id = ?").bind(id).first();
  if (item?.article_id) {
    if (item.type === "handpicked") {
      await db.prepare("UPDATE articles SET is_handpicked = ? WHERE id = ?").bind(newActive, item.article_id).run();
    } else if (item.type === "breaking") {
      await db.prepare("UPDATE articles SET is_breaking = ? WHERE id = ?").bind(newActive, item.article_id).run();
    }
  }

  return { id, is_active: newActive };
}

/**
 * Reorders items by updating their priority values based on array position
 */
export async function updateCuratedNewsPriorities(orderedIds = []) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return;
  const db = await getDb();

  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    // Index 0 gets highest priority
    const priority = (orderedIds.length - i) * 10;
    await db
      .prepare("UPDATE curated_news SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(priority, id)
      .run();
  }
}

/**
 * Returns active handpicked news for public homepage & handpicked category showcase
 */
export async function getActiveHandpickedArticles(limit = 4) {
  const db = await getDb();

  // 1. Fetch active handpicked items from curated_news join articles
  const { results: curatedRows } = await db
    .prepare(
      `SELECT c.id as curation_id, c.custom_title, c.priority,
              a.*
       FROM curated_news c
       JOIN articles a ON c.article_id = a.id
       WHERE c.type = 'handpicked' 
         AND c.is_active = 1 
         AND a.status = 'published'
       ORDER BY c.priority DESC, c.created_at DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();

  const curatedArticles = (curatedRows || []).map((row) => {
    const mapped = mapDbArticleToFrontend(row);
    if (row.custom_title) {
      mapped.headline = row.custom_title;
    }
    return {
      ...mapped,
      isHandpicked: true,
      curationId: row.curation_id,
    };
  });

  // 2. Also check if articles have is_handpicked = 1 that aren't already included
  if (curatedArticles.length < limit) {
    const needed = limit - curatedArticles.length;
    const existingIds = new Set(curatedArticles.map((a) => a.dbId || a.id));

    const { results: directRows } = await db
      .prepare(
        `SELECT * FROM articles 
         WHERE status = 'published' AND is_handpicked = 1 
         ORDER BY created_at DESC 
         LIMIT ?`
      )
      .bind(needed + 5)
      .all();

    (directRows || []).forEach((row) => {
      if (curatedArticles.length < limit && !existingIds.has(row.id)) {
        existingIds.add(row.id);
        const mapped = mapDbArticleToFrontend(row);
        curatedArticles.push({ ...mapped, isHandpicked: true });
      }
    });
  }

  // 3. Fallback: if database has fewer than limit handpicked articles,
  // supplement from static handpickedNewsList so the homepage grid layout doesn't break
  if (curatedArticles.length < limit) {
    const existingTitles = new Set(curatedArticles.map((a) => a.headline));
    const needed = limit - curatedArticles.length;
    const fallback = handpickedNewsList
      .filter((item) => !existingTitles.has(item.headline))
      .slice(0, needed);
    curatedArticles.push(...fallback);
  }

  return curatedArticles.slice(0, limit);
}
