import { getDb, query, queryOne, withTransaction } from "@/lib/db";
import { mapDbArticleToFrontend } from "./articleRepository";






export async function getCuratedNews(type) {
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

  const rows = await query(sql, params);
  return rows || [];
}

export async function addCuratedNews({ type, articleId, customTitle = "", customUrl = "", priority }) {
  return await withTransaction(async (tx) => {

    if (articleId) {
      const existing = await tx.queryOne(
        "SELECT id FROM curated_news WHERE type = ? AND article_id = ?",
        [type, articleId]
      );
      if (existing) {
        throw new Error("এই সংবাদটি ইতিমধ্যে তালিকায় বিদ্যমান।");
      }
    }

    const id = `cur_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;


    let resolvedPriority = Number(priority);
    if (isNaN(resolvedPriority) || resolvedPriority === 0) {
      const maxRow = await tx.queryOne(
        "SELECT COALESCE(MAX(priority), 0) as max_p FROM curated_news WHERE type = ?",
        [type]
      );
      resolvedPriority = (maxRow?.max_p || 0) + 10;
    }

    await tx.query(
      `INSERT INTO curated_news (id, type, article_id, custom_title, custom_url, priority, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, type, articleId || null, customTitle || null, customUrl || null, resolvedPriority]
    );


    if (articleId) {
      if (type === "handpicked") {
        await tx.query("UPDATE articles SET is_handpicked = 1 WHERE id = ?", [articleId]);
      } else if (type === "breaking") {
        await tx.query("UPDATE articles SET is_breaking = 1 WHERE id = ?", [articleId]);
      }
    }

    return { id, type, articleId };
  });
}

export async function removeCuratedNews(id) {
  return await withTransaction(async (tx) => {
    const existing = await tx.queryOne("SELECT * FROM curated_news WHERE id = ?", [id]);
    await tx.query("DELETE FROM curated_news WHERE id = ?", [id]);


    if (existing?.article_id) {
      if (existing.type === "handpicked") {
        const remaining = await tx.queryOne(
          "SELECT COUNT(*) as count FROM curated_news WHERE article_id = ? AND type = 'handpicked'",
          [existing.article_id]
        );
        if (!remaining || Number(remaining.count) === 0) {
          await tx.query("UPDATE articles SET is_handpicked = 0 WHERE id = ?", [existing.article_id]);
        }
      } else if (existing.type === "breaking") {
        const remaining = await tx.queryOne(
          "SELECT COUNT(*) as count FROM curated_news WHERE article_id = ? AND type = 'breaking'",
          [existing.article_id]
        );
        if (!remaining || Number(remaining.count) === 0) {
          await tx.query("UPDATE articles SET is_breaking = 0 WHERE id = ?", [existing.article_id]);
        }
      }
    }

    return { id };
  });
}

export async function toggleCuratedNews(id, currentActive) {
  const newActive = currentActive ? 0 : 1;

  return await withTransaction(async (tx) => {
    await tx.query(
      "UPDATE curated_news SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newActive, id]
    );

    const item = await tx.queryOne("SELECT * FROM curated_news WHERE id = ?", [id]);
    if (item?.article_id) {
      if (item.type === "handpicked") {
        await tx.query("UPDATE articles SET is_handpicked = ? WHERE id = ?", [newActive, item.article_id]);
      } else if (item.type === "breaking") {
        await tx.query("UPDATE articles SET is_breaking = ? WHERE id = ?", [newActive, item.article_id]);
      }
    }

    return { id, is_active: newActive };
  });
}



export async function updateCuratedNewsPriorities(orderedIds = []) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return;

  return await withTransaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      const priority = (orderedIds.length - i) * 10;
      await tx.query(
        "UPDATE curated_news SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [priority, id]
      );
    }
  });
}



export async function saveCuratedNewsBatch(type, items = []) {
  if (!type) throw new Error("কিউরেশন ধরন আবশ্যক।");

  return await withTransaction(async (tx) => {

    const existingRows = await tx.query(
      "SELECT article_id FROM curated_news WHERE type = ? AND article_id IS NOT NULL",
      [type]
    );
    const previousArticleIds = new Set((existingRows || []).map((r) => r.article_id).filter(Boolean));


    await tx.query("DELETE FROM curated_news WHERE type = ?", [type]);


    const activeArticleIds = new Set();
    const insertedArticleIds = new Set();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const articleId = item.article_id || null;
      if (articleId) {
        if (insertedArticleIds.has(articleId)) continue;
        insertedArticleIds.add(articleId);
      }
      const id = item.id && !String(item.id).startsWith("temp_")
        ? String(item.id)
        : `cur_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const priority = (items.length - i) * 10;
      const isActive = item.is_active === 0 ? 0 : 1;
      const customTitle = item.custom_title || null;
      const customUrl = item.custom_url || null;

      await tx.query(
        `INSERT INTO curated_news (id, type, article_id, custom_title, custom_url, priority, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [id, type, articleId, customTitle, customUrl, priority, isActive]
      );

      if (articleId && isActive === 1) {
        activeArticleIds.add(articleId);
      }
    }


    const allAffected = new Set([...previousArticleIds, ...activeArticleIds]);
    const flagColumn = type === "handpicked" ? "is_handpicked" : (type === "breaking" ? "is_breaking" : null);

    if (flagColumn && allAffected.size > 0) {
      for (const artId of allAffected) {
        const flagVal = activeArticleIds.has(artId) ? 1 : 0;
        await tx.query(
          `UPDATE articles SET ${flagColumn} = ? WHERE id = ?`,
          [flagVal, artId]
        );
      }
    }

    return { success: true, count: items.length };
  });
}



export async function getActiveHandpickedArticles(limit = 4) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 4), 20);
  try {
    const curatedRows = await query(
      `SELECT c.id as curation_id, c.custom_title, c.custom_url, c.priority,
              a.*
       FROM curated_news c
       LEFT JOIN articles a ON c.article_id = a.id
       WHERE c.type = 'handpicked' AND c.is_active = 1
       ORDER BY c.priority DESC, c.created_at DESC
       LIMIT ?`,
      [safeLimit]
    );

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

    if (curatedArticles.length < safeLimit) {
      const needed = safeLimit - curatedArticles.length;
      const existingIds = new Set(curatedArticles.map((a) => a.dbId || a.id));

      const directRows = await query(
        `SELECT * FROM articles 
         WHERE status = 'published' AND is_handpicked = 1 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [needed + 5]
      );

      (directRows || []).forEach((row) => {
        if (curatedArticles.length < safeLimit && !existingIds.has(row.id)) {
          existingIds.add(row.id);
          const mapped = mapDbArticleToFrontend(row);
          curatedArticles.push({ ...mapped, isHandpicked: true });
        }
      });
    }

    return curatedArticles.slice(0, safeLimit);
  } catch (error) {
    console.error("[Curation] Error loading active handpicked articles:", error?.message || error);
    return [];
  }
}



export async function getActiveBreakingNews(limit = 10) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 50);
  try {
    const curatedRows = await query(
      `SELECT c.id, c.custom_title, c.custom_url, c.priority, c.article_id,
              a.headline as article_headline, a.slug as article_slug
       FROM curated_news c
       LEFT JOIN articles a ON c.article_id = a.id
       WHERE c.type = 'breaking' AND c.is_active = 1
       ORDER BY c.priority DESC, c.created_at DESC
       LIMIT ?`,
      [safeLimit]
    );

    const breakingItems = (curatedRows || []).map((row) => ({
      id: row.id,
      headline: row.custom_title || row.article_headline || "জরুরি সংবাদ",
      url: row.custom_url || (row.article_slug ? `/article/${row.article_slug}` : (row.article_id ? `/article/${row.article_id}` : "#")),
      articleId: row.article_id,
    }));

    if (breakingItems.length < safeLimit) {
      const existingArticleIds = new Set(breakingItems.map((b) => b.articleId).filter(Boolean));
      const needed = safeLimit - breakingItems.length;

      const directRows = await query(
        `SELECT id, headline, slug FROM articles
         WHERE status = 'published' AND is_breaking = 1
         ORDER BY created_at DESC 
         LIMIT ?`,
        [needed + 5]
      );

      (directRows || []).forEach((art) => {
        if (breakingItems.length < safeLimit && !existingArticleIds.has(art.id)) {
          existingArticleIds.add(art.id);
          breakingItems.push({
            id: `art_${art.id}`,
            headline: art.headline,
            url: `/article/${art.slug || art.id}`,
          });
        }
      });
    }

    return breakingItems.slice(0, safeLimit);
  } catch (error) {
    console.error("[Curation] Error loading active breaking news:", error?.message || error);
    return [];
  }
}
