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

/**
 * Robust article lookup supporting both raw and URL-decoded slugs and IDs
 */
export async function findArticleBySlugOrId(identifier) {
  if (!identifier) return null;
  const db = await getDb();
  const raw = String(identifier).trim();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  // 1. Try slug by decoded and raw
  let row = await db.prepare("SELECT * FROM articles WHERE slug = ?").bind(decoded).first();
  if (row) return row;

  if (decoded !== raw) {
    row = await db.prepare("SELECT * FROM articles WHERE slug = ?").bind(raw).first();
    if (row) return row;
  }

  // 2. Try id by raw and decoded
  row = await db.prepare("SELECT * FROM articles WHERE id = ?").bind(raw).first();
  if (row) return row;

  if (decoded !== raw) {
    row = await db.prepare("SELECT * FROM articles WHERE id = ?").bind(decoded).first();
    if (row) return row;
  }

  return null;
}

/**
 * Fetch published articles ordered newest first
 */
export async function getPublishedArticles({ categorySlug, limit = 20, offset = 0 } = {}) {
  const db = await getDb();
  if (categorySlug && categorySlug !== "all" && categorySlug !== "latest") {
    const { results } = await db
      .prepare(
        "SELECT * FROM articles WHERE status = 'published' AND category_slug = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
      )
      .bind(categorySlug, limit, offset)
      .all();
    return results || [];
  }

  const { results } = await db
    .prepare(
      "SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC LIMIT ? OFFSET ?"
    )
    .bind(limit, offset)
    .all();
  return results || [];
}

/**
 * Normalizes SQLite timestamp to valid ISO string for consistent sorting and parsing
 */
function normalizeTimestamp(ts) {
  if (!ts) return new Date().toISOString();
  if (typeof ts !== "string") return new Date(ts).toISOString();
  if (ts.includes("T")) return ts;
  return ts.replace(" ", "T") + "Z";
}

/**
 * Maps a database row from SQLite / D1 to the standard frontend article schema
 */
export function mapDbArticleToFrontend(dbRow) {
  if (!dbRow) return null;

  // Normalize images array (max 3)
  let imagesArray = [];
  if (Array.isArray(dbRow.images)) {
    imagesArray = dbRow.images.filter(Boolean).slice(0, 3);
  } else if (typeof dbRow.images === "string" && dbRow.images.trim()) {
    try {
      const parsed = JSON.parse(dbRow.images);
      if (Array.isArray(parsed)) {
        imagesArray = parsed.filter(Boolean).slice(0, 3);
      } else if (parsed) {
        imagesArray = [String(parsed)];
      }
    } catch {
      imagesArray = [dbRow.images.trim()];
    }
  } else if (dbRow.image) {
    imagesArray = [dbRow.image];
  }

  const primaryImage = imagesArray[0] || dbRow.image || null;
  const isoTime = normalizeTimestamp(dbRow.published_at || dbRow.created_at);

  return {
    id: dbRow.slug || dbRow.id,
    dbId: dbRow.id,
    slug: dbRow.slug,
    headline: dbRow.headline || "",
    summary: dbRow.summary || "",
    content: dbRow.content || "",
    category: dbRow.category_name || "জাতীয়",
    categorySlug: dbRow.category_slug || "national",
    subcategory: dbRow.subcategory_name || null,
    subcategorySlug: dbRow.subcategory_name ? encodeURIComponent(dbRow.subcategory_name) : null,
    image: primaryImage,
    images: imagesArray,
    youtubeUrl: dbRow.youtube_url || null,
    author: dbRow.author_name || "নিজস্ব প্রতিবেদক",
    location: dbRow.location || "ঢাকা",
    time: isoTime,
    publishedAt: isoTime,
    createdAt: dbRow.created_at,
    hasCustomImage: Boolean(primaryImage),
    status: dbRow.status || "published",
    isLead: Boolean(dbRow.is_lead),
    isBreaking: Boolean(dbRow.is_breaking),
    isHandpicked: Boolean(dbRow.is_handpicked),
  };
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

