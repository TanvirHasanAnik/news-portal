import { getDb } from "@/lib/db";
import { mapDbArticleToFrontend } from "./articleRepository";
import { handpickedNewsList } from "@/data/handpickedNewsData";
import { breakingNews as fallbackBreakingNews } from "@/data/newsData";

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
 * Saves a full batch of curated items for a type (handpicked or breaking).
 * Updates priority based on array order, persists active states,
 * and synchronizes article flags.
 */
export async function saveCuratedNewsBatch(type, items = []) {
  if (!type) throw new Error("কিউরেশন ধরন আবশ্যক।");
  const db = await getDb();

  // 1. Get existing curated article IDs for this type
  const { results: existingRows } = await db
    .prepare("SELECT article_id FROM curated_news WHERE type = ? AND article_id IS NOT NULL")
    .bind(type)
    .all();
  const previousArticleIds = new Set((existingRows || []).map((r) => r.article_id).filter(Boolean));

  // 2. Clear current curated_news entries for this type
  await db.prepare("DELETE FROM curated_news WHERE type = ?").bind(type).run();

  // 3. Insert the new batch of items in order with priority = (items.length - i) * 10
  const activeArticleIds = new Set();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const id = item.id && !String(item.id).startsWith("temp_")
      ? String(item.id)
      : `cur_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const priority = (items.length - i) * 10;
    const isActive = item.is_active === 0 ? 0 : 1;
    const articleId = item.article_id || null;
    const customTitle = item.custom_title || null;
    const customUrl = item.custom_url || null;

    await db
      .prepare(
        `INSERT INTO curated_news (id, type, article_id, custom_title, custom_url, priority, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .bind(id, type, articleId, customTitle, customUrl, priority, isActive)
      .run();

    if (articleId && isActive === 1) {
      activeArticleIds.add(articleId);
    }
  }

  // 4. Synchronize article table flags (is_handpicked or is_breaking)
  const allAffected = new Set([...previousArticleIds, ...activeArticleIds]);
  const flagColumn = type === "handpicked" ? "is_handpicked" : (type === "breaking" ? "is_breaking" : null);

  if (flagColumn && allAffected.size > 0) {
    for (const artId of allAffected) {
      const flagVal = activeArticleIds.has(artId) ? 1 : 0;
      await db
        .prepare(`UPDATE articles SET ${flagColumn} = ? WHERE id = ?`)
        .bind(flagVal, artId)
        .run();
    }
  }

  return { success: true, count: items.length };
}

/**
 * Returns active handpicked news for public homepage & handpicked category showcase
 */
export async function getActiveHandpickedArticles(limit = 4) {
  const db = await getDb();

  // 1. Fetch active handpicked items from curated_news join articles
  const { results: curatedRows } = await db
    .prepare(
      `SELECT c.id as curation_id, c.custom_title, c.custom_url, c.priority, c.article_id,
              a.*
       FROM curated_news c
       LEFT JOIN articles a ON c.article_id = a.id
       WHERE c.type = 'handpicked' 
         AND c.is_active = 1 
         AND (a.status = 'published' OR c.article_id IS NULL)
       ORDER BY c.priority DESC, c.created_at DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();

  const curatedArticles = (curatedRows || []).map((row) => {
    if (row.id && row.status) {
      const mapped = mapDbArticleToFrontend(row);
      if (row.custom_title) {
        mapped.headline = row.custom_title;
      }
      return {
        ...mapped,
        isHandpicked: true,
        curationId: row.curation_id,
      };
    } else {
      return {
        id: row.curation_id,
        dbId: row.curation_id,
        slug: row.custom_url ? row.custom_url.replace(/^\//, "") : row.curation_id,
        headline: row.custom_title || "বাছাইকৃত সংবাদ",
        summary: "",
        category: "বাছাইকৃত",
        categorySlug: "handpicked",
        image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop",
        isHandpicked: true,
        curationId: row.curation_id,
        author: "সম্পাদকীয় বিভাগ",
        time: "বাছাইকৃত",
      };
    }
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

/**
 * Returns active breaking news for public header ticker, synced with database
 */
export async function getActiveBreakingNews(limit = 10) {
  const db = await getDb();

  // 1. Fetch active breaking items from curated_news
  const { results: curatedRows } = await db
    .prepare(
      `SELECT c.id, c.custom_title, c.custom_url, c.priority, c.article_id,
              a.headline as article_headline, a.slug as article_slug
       FROM curated_news c
       LEFT JOIN articles a ON c.article_id = a.id
       WHERE c.type = 'breaking' AND c.is_active = 1
       ORDER BY c.priority DESC, c.created_at DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();

  const breakingItems = (curatedRows || []).map((row) => ({
    id: row.id,
    headline: row.custom_title || row.article_headline || "জরুরি সংবাদ",
    url: row.custom_url || (row.article_slug ? `/article/${row.article_slug}` : (row.article_id ? `/article/${row.article_id}` : "#")),
    articleId: row.article_id,
  }));

  // 2. Also check published articles where is_breaking = 1 that aren't already included
  if (breakingItems.length < limit) {
    const existingArticleIds = new Set(breakingItems.map((b) => b.articleId).filter(Boolean));
    const needed = limit - breakingItems.length;

    const { results: directRows } = await db
      .prepare(
        `SELECT id, headline, slug FROM articles
         WHERE status = 'published' AND is_breaking = 1
         ORDER BY created_at DESC
         LIMIT ?`
      )
      .bind(needed + 5)
      .all();

    (directRows || []).forEach((art) => {
      if (breakingItems.length < limit && !existingArticleIds.has(art.id)) {
        existingArticleIds.add(art.id);
        breakingItems.push({
          id: `art_${art.id}`,
          headline: art.headline,
          url: `/article/${art.slug || art.id}`,
        });
      }
    });
  }

  // 3. Fallback to static breakingNews if nothing is in DB yet
  if (breakingItems.length === 0) {
    return fallbackBreakingNews;
  }

  return breakingItems.slice(0, limit);
}
