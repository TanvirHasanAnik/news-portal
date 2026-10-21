import { getDb } from "@/lib/db";

/**
 * Article Repository
 * Direct Cloudflare D1 / SQLite database queries using raw D1 statements.
 */

export async function createArticle(data) {
  const db = await getDb();
  const id = data.id || `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const slug = data.slug || `${Date.now()}`;
  const publishedAt = data.status === "published" ? new Date().toISOString() : null;

  const insertSql = `
    INSERT INTO articles (
      id, headline, slug, summary, content,
      category_id, category_name, category_slug,
      subcategory_id, subcategory_name,
      images, image, youtube_url,
      author_id, author_name, location, read_time,
      status, is_breaking, is_lead, is_handpicked,
      view_count, published_at, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
  `;

  // Parse images: ensure array format and maximum 3 images
  let imagesJson = null;
  let primaryImage = data.image || null;

  if (Array.isArray(data.images)) {
    const sliced = data.images.slice(0, 3);
    imagesJson = JSON.stringify(sliced);
    primaryImage = primaryImage || sliced[0] || null;
  } else if (typeof data.images === "string" && data.images.trim()) {
    try {
      const parsed = JSON.parse(data.images);
      if (Array.isArray(parsed)) {
        const sliced = parsed.slice(0, 3);
        imagesJson = JSON.stringify(sliced);
        primaryImage = primaryImage || sliced[0] || null;
      } else {
        imagesJson = JSON.stringify([data.images]);
        primaryImage = primaryImage || data.images;
      }
    } catch {
      imagesJson = JSON.stringify([data.images]);
      primaryImage = primaryImage || data.images;
    }
  } else if (primaryImage) {
    imagesJson = JSON.stringify([primaryImage]);
  }

  const bindParams = [
    id,
    data.headline,
    slug,
    data.summary || "",
    data.content || "",
    data.categoryId || null,
    data.categoryName || "",
    data.categorySlug || "",
    data.subcategoryId || null,
    data.subcategoryName || null,
    imagesJson,
    primaryImage,
    data.youtubeUrl || null,
    data.authorId || "usr_reporter",
    data.authorName || "নিজস্ব প্রতিবেদক",
    data.location || "ঢাকা",
    data.readTime || "৩ মিনিট পাঠ",
    data.status || "published",
    data.isBreaking ? 1 : 0,
    data.isLead ? 1 : 0,
    data.isHandpicked ? 1 : 0,
    publishedAt,
  ];

  try {
    await db.prepare(insertSql).bind(...bindParams).run();
  } catch (err) {
    if (err?.message?.includes("no column named images")) {
      // Self-heal: automatically add the missing 'images' column to Cloudflare D1
      try {
        await db.prepare("ALTER TABLE articles ADD COLUMN images TEXT").run();
        await db.prepare(insertSql).bind(...bindParams).run();
      } catch (_retryErr) {
        // Fallback: insert without 'images' column, saving primary image into 'image'
        const fallbackSql = `
          INSERT INTO articles (
            id, headline, slug, summary, content,
            category_id, category_name, category_slug,
            subcategory_id, subcategory_name,
            image, youtube_url,
            author_id, author_name, location, read_time,
            status, is_breaking, is_lead, is_handpicked,
            view_count, published_at, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?,
            ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `;
        await db.prepare(fallbackSql).bind(
          id,
          data.headline,
          slug,
          data.summary || "",
          data.content || "",
          data.categoryId || null,
          data.categoryName || "",
          data.categorySlug || "",
          data.subcategoryId || null,
          data.subcategoryName || null,
          primaryImage,
          data.youtubeUrl || null,
          data.authorId || "usr_reporter",
          data.authorName || "নিজস্ব প্রতিবেদক",
          data.location || "ঢাকা",
          data.readTime || "৩ মিনিট পাঠ",
          data.status || "published",
          data.isBreaking ? 1 : 0,
          data.isLead ? 1 : 0,
          data.isHandpicked ? 1 : 0,
          publishedAt
        ).run();
      }
    } else {
      throw err;
    }
  }

  // Create initial revision entry in article_revisions
  try {
    await db.prepare(`
      INSERT INTO article_revisions (id, article_id, editor_id, headline, summary, content, change_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `rev_${Date.now()}`,
      id,
      data.authorId || "usr_reporter",
      data.headline,
      data.summary || "",
      data.content || "",
      "Initial publication / creation"
    ).run();
  } catch (_e) {
    // Non-critical revision logging
  }

  // Record audit log
  try {
    await db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      `log_${Date.now()}`,
      data.authorId || "usr_reporter",
      "create_article",
      "article",
      id,
      JSON.stringify({ headline: data.headline, status: data.status, category: data.categoryName })
    ).run();
  } catch (_e) {
    // Non-critical audit logging
  }

  return { id, slug };
}

export async function getArticleById(id) {
  const db = await getDb();
  return await db.prepare("SELECT * FROM articles WHERE id = ?").bind(id).first();
}

export async function getArticleBySlug(slug) {
  const db = await getDb();
  return await db.prepare("SELECT * FROM articles WHERE slug = ?").bind(slug).first();
}

export async function getRecentArticles(limit = 10) {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT * FROM articles ORDER BY created_at DESC LIMIT ?")
    .bind(limit)
    .all();
  return results || [];
}

export async function getAllArticles({ status, limit = 20, offset = 0 } = {}) {
  const db = await getDb();
  if (status) {
    const { results } = await db
      .prepare("SELECT * FROM articles WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .bind(status, limit, offset)
      .all();
    return results || [];
  }
  const { results } = await db
    .prepare("SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?")
    .bind(limit, offset)
    .all();
  return results || [];
}

export async function deleteArticle(id) {
  const db = await getDb();
  return await db.prepare("DELETE FROM articles WHERE id = ?").bind(id).run();
}

