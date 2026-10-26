import { getDb, query, queryOne, withTransaction } from "@/lib/db";

/**
 * Article Repository
 * Raw MySQL (mysql2/promise) data layer designed for Cloudflare Workers (workerd) & TiDB.
 *
 * Guardrails:
 * 1. Zero SQL Injection: Strict parameterization for all dynamic arguments.
 * 2. UTF-8 (utf8mb4) & Timezone (UTC) compliance.
 * 3. Prepared Statement Safety: No unparameterized concatenations.
 * 4. TiDB RU optimization: Compound indexed lookups, covered scans, and structured pagination.
 * 5. Robust Transactions: Multi-step mutations execute within atomic transaction blocks.
 */

/**
 * Normalizes SQL timestamp/date to valid UTC ISO string for consistent parsing and frontend rendering
 */
function normalizeTimestamp(ts) {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  const str = String(ts).trim();
  if (str.includes("T")) {
    return str.endsWith("Z") ? str : `${str}Z`;
  }
  return str.replace(" ", "T") + "Z";
}

/**
 * Maps a database row from MySQL/TiDB to the standard frontend article schema
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
    category_name: dbRow.category_name || "জাতীয়",
    category_slug: dbRow.category_slug || "national",
    subcategory: dbRow.subcategory_name || null,
    subcategorySlug: dbRow.subcategory_name ? encodeURIComponent(dbRow.subcategory_name) : null,
    image: primaryImage,
    images: imagesArray,
    youtubeUrl: dbRow.youtube_url || null,
    author: dbRow.author_name || "নিজস্ব প্রতিবেদক",
    authorId: dbRow.author_id || null,
    authorName: dbRow.author_name || "নিজস্ব প্রতিবেদক",
    createdBy: dbRow.created_by || dbRow.author_name || "নিজস্ব প্রতিবেদক",
    created_by: dbRow.created_by || dbRow.author_name || "নিজস্ব প্রতিবেদক",
    lastEditedBy: dbRow.last_edited_by || dbRow.created_by || dbRow.author_name || "নিজস্ব প্রতিবেদক",
    last_edited_by: dbRow.last_edited_by || dbRow.created_by || dbRow.author_name || "নিজস্ব প্রতিবেদক",
    location: dbRow.location || "ঢাকা",
    time: isoTime,
    publishedAt: isoTime,
    createdAt: normalizeTimestamp(dbRow.created_at),
    created_at: dbRow.created_at,
    updatedAt: normalizeTimestamp(dbRow.updated_at || dbRow.created_at),
    updated_at: dbRow.updated_at,
    hasCustomImage: Boolean(primaryImage),
    status: dbRow.status === "pending_approval" ? "pending" : (dbRow.status || "published"),
    isLead: Boolean(dbRow.is_lead),
    isBreaking: Boolean(dbRow.is_breaking),
    isHandpicked: Boolean(dbRow.is_handpicked),
  };
}

/**
 * Creates an article with atomic revision history and audit logging inside a transaction
 */
export async function createArticle(data) {
  const id = data.id || `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const slug = data.slug || `${Date.now()}`;
  const isPublished = data.status === "published";
  const publishedAt = isPublished ? new Date() : null;

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

  const createdBy = data.createdBy || data.authorUsername || data.authorName || "নিজস্ব প্রতিবেদক";
  const lastEditedBy = data.lastEditedBy || createdBy;

  const insertSql = `
    INSERT INTO articles (
      id, headline, slug, summary, content,
      category_id, category_name, category_slug,
      subcategory_id, subcategory_name,
      images, image, youtube_url,
      author_id, author_name, location, read_time,
      status, is_breaking, is_lead, is_handpicked,
      created_by, last_edited_by,
      view_count, published_at, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
  `;

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
    createdBy,
    lastEditedBy,
    publishedAt,
  ];

  await withTransaction(async (tx) => {
    // 1. Insert article
    await tx.query(insertSql, bindParams);

    // 2. Insert revision log
    await tx.query(
      `INSERT INTO article_revisions (id, article_id, editor_id, headline, summary, content, change_summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `rev_${Date.now()}`,
        id,
        data.authorId || "usr_reporter",
        data.headline,
        data.summary || "",
        data.content || "",
        "Initial publication / creation",
      ]
    );

    // 3. Record audit log
    await tx.query(
      `INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `log_${Date.now()}`,
        data.authorId || "usr_reporter",
        "create_article",
        "article",
        id,
        JSON.stringify({ headline: data.headline, status: data.status, category: data.categoryName, created_by: createdBy }),
      ]
    );
  });

  return { id, slug };
}

/**
 * Updates an existing article with atomic revision logging and automatic audit tracking (last_edited_by)
 */
export async function updateArticle(id, data) {
  const current = await getArticleById(id);
  if (!current) {
    throw new Error("সংবাদটি খুঁজে পাওয়া যায়নি");
  }

  const editorUsername = data.lastEditedBy || data.editorUsername || "সম্পাদক";
  const editorId = data.editorId || current.author_id || "usr_editor";

  // Parse images if provided
  let imagesJson = current.images;
  let primaryImage = current.image;

  if (data.images !== undefined) {
    if (Array.isArray(data.images)) {
      const sliced = data.images.slice(0, 3);
      imagesJson = JSON.stringify(sliced);
      primaryImage = data.image || sliced[0] || null;
    } else if (typeof data.images === "string" && data.images.trim()) {
      try {
        const parsed = JSON.parse(data.images);
        if (Array.isArray(parsed)) {
          const sliced = parsed.slice(0, 3);
          imagesJson = JSON.stringify(sliced);
          primaryImage = data.image || sliced[0] || null;
        } else {
          imagesJson = JSON.stringify([data.images]);
          primaryImage = data.image || data.images;
        }
      } catch {
        imagesJson = JSON.stringify([data.images]);
        primaryImage = data.image || data.images;
      }
    } else if (data.image) {
      imagesJson = JSON.stringify([data.image]);
      primaryImage = data.image;
    }
  }

  const newStatus = data.status || current.status;
  const isNowPublished = newStatus === "published";
  const publishedAt = isNowPublished ? (current.published_at || new Date()) : current.published_at;

  const updateSql = `
    UPDATE articles SET
      headline = ?,
      summary = ?,
      content = ?,
      category_id = ?,
      category_name = ?,
      category_slug = ?,
      subcategory_id = ?,
      subcategory_name = ?,
      images = ?,
      image = ?,
      youtube_url = ?,
      location = ?,
      read_time = ?,
      status = ?,
      is_breaking = ?,
      is_lead = ?,
      is_handpicked = ?,
      last_edited_by = ?,
      published_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const bindParams = [
    data.headline !== undefined ? data.headline : current.headline,
    data.summary !== undefined ? data.summary : current.summary,
    data.content !== undefined ? data.content : current.content,
    data.categoryId !== undefined ? data.categoryId : current.category_id,
    data.categoryName !== undefined ? data.categoryName : current.category_name,
    data.categorySlug !== undefined ? data.categorySlug : current.category_slug,
    data.subcategoryId !== undefined ? data.subcategoryId : current.subcategory_id,
    data.subcategoryName !== undefined ? data.subcategoryName : current.subcategory_name,
    imagesJson,
    primaryImage,
    data.youtubeUrl !== undefined ? data.youtubeUrl : current.youtube_url,
    data.location !== undefined ? data.location : current.location,
    data.readTime !== undefined ? data.readTime : current.read_time,
    newStatus,
    data.isBreaking !== undefined ? (data.isBreaking ? 1 : 0) : current.is_breaking,
    data.isLead !== undefined ? (data.isLead ? 1 : 0) : current.is_lead,
    data.isHandpicked !== undefined ? (data.isHandpicked ? 1 : 0) : current.is_handpicked,
    editorUsername,
    publishedAt,
    id,
  ];

  await withTransaction(async (tx) => {
    // 1. Update article record
    await tx.query(updateSql, bindParams);

    // 2. Insert revision log
    await tx.query(
      `INSERT INTO article_revisions (id, article_id, editor_id, headline, summary, content, change_summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `rev_${Date.now()}`,
        id,
        editorId,
        data.headline || current.headline,
        data.summary || current.summary || "",
        data.content || current.content || "",
        data.changeSummary || `সম্পাদনা করেছেন: ${editorUsername}`,
      ]
    );

    // 3. Record audit log
    await tx.query(
      `INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `log_${Date.now()}`,
        editorId,
        "edit_article",
        "article",
        id,
        JSON.stringify({
          headline: data.headline || current.headline,
          status: newStatus,
          last_edited_by: editorUsername,
        }),
      ]
    );
  });

  return { id, slug: current.slug };
}

export async function getArticleById(id) {
  return await queryOne("SELECT * FROM articles WHERE id = ?", [id]);
}

export async function getArticleBySlug(slug) {
  return await queryOne("SELECT * FROM articles WHERE slug = ?", [slug]);
}

/**
 * Robust article lookup supporting both raw and URL-decoded slugs and IDs
 */
export async function findArticleBySlugOrId(identifier) {
  if (!identifier) return null;
  const raw = String(identifier).trim();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  // 1. Try slug by decoded and raw
  let row = await queryOne("SELECT * FROM articles WHERE slug = ?", [decoded]);
  if (row) return row;

  if (decoded !== raw) {
    row = await queryOne("SELECT * FROM articles WHERE slug = ?", [raw]);
    if (row) return row;
  }

  // 2. Try id by raw and decoded
  row = await queryOne("SELECT * FROM articles WHERE id = ?", [raw]);
  if (row) return row;

  if (decoded !== raw) {
    row = await queryOne("SELECT * FROM articles WHERE id = ?", [decoded]);
    if (row) return row;
  }

  return null;
}

/**
 * Fetch published articles ordered newest first with parameterized pagination.
 * Reduces TiDB Request Units (RU) by utilizing covered composite indexes (status, category_slug, created_at).
 */
export async function getPublishedArticles({ categorySlug, limit = 20, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
  const safeOffset = Math.max(0, Number(offset) || 0);

  // 1. Permanent Category 'handpicked': Query articles marked as handpicked
  if (categorySlug === "handpicked") {
    const rows = await query(
      "SELECT * FROM articles WHERE status = 'published' AND is_handpicked = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [safeLimit, safeOffset]
    );
    return rows || [];
  }

  // 2. Permanent Category 'latest' or 'all': Query all latest published articles across all categories
  if (!categorySlug || categorySlug === "all" || categorySlug === "latest") {
    const rows = await query(
      "SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [safeLimit, safeOffset]
    );
    return rows || [];
  }

  // 3. Dynamic Category (e.g. 'national', 'politics', 'sports', etc.)
  const rows = await query(
    "SELECT * FROM articles WHERE status = 'published' AND category_slug = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [categorySlug, safeLimit, safeOffset]
  );
  return rows || [];
}

export async function getRecentArticles({ authorId, createdBy, limit = 10 } = {}) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 100);
  if (authorId || createdBy) {
    const rows = await query(
      "SELECT * FROM articles WHERE (author_id = ? OR created_by = ?) ORDER BY created_at DESC LIMIT ?",
      [authorId || "", createdBy || "", safeLimit]
    );
    return rows || [];
  }
  const rows = await query(
    "SELECT * FROM articles ORDER BY created_at DESC LIMIT ?",
    [safeLimit]
  );
  return rows || [];
}

export async function getAllArticles({ status, authorId, createdBy, limit = 50, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 50), 200);
  const safeOffset = Math.max(0, Number(offset) || 0);

  const conditions = [];
  const params = [];

  if (status && status !== "all") {
    if (status === "pending") {
      conditions.push("(status = 'pending' OR status = 'pending_approval')");
    } else {
      conditions.push("status = ?");
      params.push(status);
    }
  }

  if (authorId || createdBy) {
    conditions.push("(author_id = ? OR created_by = ?)");
    params.push(authorId || "", createdBy || "");
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT * FROM articles ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(safeLimit, safeOffset);

  const rows = await query(sql, params);
  return rows || [];
}

export async function deleteArticle(id) {
  return await withTransaction(async (tx) => {
    // Cascade-delete dependent revisions and curated references
    await tx.query("DELETE FROM article_revisions WHERE article_id = ?", [id]);
    await tx.query("DELETE FROM curated_news WHERE article_id = ?", [id]);
    await tx.query("DELETE FROM analytics_page_views WHERE article_id = ?", [id]);
    return await tx.query("DELETE FROM articles WHERE id = ?", [id]);
  });
}

/**
 * Updates an article's publishing status (published, draft, pending, rejected, archived)
 * Automatically updates last_edited_by with editor's username and logs audit trail
 */
export async function updateArticleStatus(id, status, editorId = "usr_superadmin", editorUsername = "admin") {
  return await withTransaction(async (tx) => {
    const result = await tx.query(
      `UPDATE articles 
       SET status = ?, 
           published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, CURRENT_TIMESTAMP) ELSE published_at END,
           last_edited_by = ?,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, status, editorUsername, id]
    );

    // Insert revision log for state transition
    const statusLabels = {
      published: "প্রকাশিত",
      draft: "খসড়া",
      pending: "পর্যালোচনার অপেক্ষায়",
      rejected: "প্রত্যাখ্যাত",
      archived: "আর্কাইভকৃত",
    };

    await tx.query(
      `INSERT INTO article_revisions (id, article_id, editor_id, headline, summary, content, change_summary, created_at)
       SELECT ?, id, ?, headline, summary, content, ?, CURRENT_TIMESTAMP
       FROM articles WHERE id = ?`,
      [
        `rev_${Date.now()}`,
        editorId,
        `স্ট্যাটাস পরিবর্তন: ${statusLabels[status] || status} (দ্বারা: @${editorUsername})`,
        id,
      ]
    );

    await tx.query(
      `INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `log_${Date.now()}`,
        editorId,
        "update_status",
        "article",
        id,
        JSON.stringify({ status, last_edited_by: editorUsername }),
      ]
    );

    return result;
  });
}

/**
 * Toggles a boolean flag on an article (is_breaking, is_lead, is_handpicked)
 */
export async function toggleArticleFlag(id, flagName) {
  const allowedFlags = ["is_breaking", "is_lead", "is_handpicked"];
  if (!allowedFlags.includes(flagName)) {
    throw new Error(`Invalid flag: ${flagName}`);
  }

  const article = await getArticleById(id);
  if (!article) throw new Error("Article not found");

  const currentVal = article[flagName] ? 1 : 0;
  const newVal = currentVal === 1 ? 0 : 1;

  await query(
    `UPDATE articles SET ${flagName} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [newVal, id]
  );

  return { [flagName]: newVal === 1 };
}

/**
 * Fetch revisions / content history for a given article
 */
export async function getArticleRevisions(articleId) {
  const rows = await query(
    `SELECT r.*, u.name as editor_name, u.username as editor_username
     FROM article_revisions r 
     LEFT JOIN users u ON r.editor_id = u.id 
     WHERE r.article_id = ? 
     ORDER BY r.created_at DESC`,
    [articleId]
  );
  return rows || [];
}

/**
 * Return counts of articles grouped by their status, optionally filtered by author
 */
export async function getArticleStatusCounts({ authorId, createdBy } = {}) {
  const hasAuthorFilter = Boolean(authorId || createdBy);
  const sql = hasAuthorFilter
    ? "SELECT status, COUNT(*) as count FROM articles WHERE (author_id = ? OR created_by = ?) GROUP BY status"
    : "SELECT status, COUNT(*) as count FROM articles GROUP BY status";
  const params = hasAuthorFilter ? [authorId || "", createdBy || ""] : [];

  const rows = await query(sql, params);

  const counts = {
    all: 0,
    published: 0,
    draft: 0,
    pending: 0,
    rejected: 0,
    archived: 0,
  };

  (rows || []).forEach((row) => {
    const num = Number(row.count) || 0;
    const st = row.status === "pending_approval" ? "pending" : row.status;
    if (counts[st] !== undefined) {
      counts[st] += num;
    }
    counts.all += num;
  });

  return counts;
}

/**
 * Reusable Business Logic for Most Read News (সর্বাধিক পঠিত সংবাদ):
 *
 * 1. Individual News 7-Day Validity:
 *    - Each news article is considered fresh/valid for 7 days from its published date:
 *      COALESCE(a.published_at, a.created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY).
 *    - Active 7-day news are prioritized and ranked primarily by views during that 7-day window.
 *
 * 2. Latest News as Fillers:
 *    - If there are fewer than `limit` articles within 7-day validity, latest published news
 *      are retained as fillers, sorted newest to oldest up to `limit` items.
 *
 * 3. Authentic Database Only:
 *    - Replaces SQLite datetime() with standard MySQL DATE_SUB(NOW(), INTERVAL 7 DAY).
 *    - Uses MySQL scalar GREATEST() for row-level maximum between direct views and logged views.
 */
export async function getMostReadArticles(limit = 10) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 50);
  let dbRows = [];

  try {
    const sql = `
      SELECT a.*,
             CASE 
               WHEN COALESCE(a.published_at, a.created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 
               ELSE 0 
             END as is_within_validity_week,
             (
               SELECT COUNT(*)
               FROM analytics_page_views v
               WHERE v.article_id = a.id
                 AND v.created_at <= DATE_ADD(COALESCE(a.published_at, a.created_at), INTERVAL 7 DAY)
             ) as individual_logged_views
      FROM articles a
      WHERE a.status = 'published'
      ORDER BY 
        is_within_validity_week DESC,
        CASE 
          WHEN COALESCE(a.published_at, a.created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 
            GREATEST(
              COALESCE(a.view_count, 0),
              (
                SELECT COUNT(*) 
                FROM analytics_page_views v 
                WHERE v.article_id = a.id 
                  AND v.created_at <= DATE_ADD(COALESCE(a.published_at, a.created_at), INTERVAL 7 DAY)
              )
            )
          ELSE 0 
        END DESC,
        a.created_at DESC
      LIMIT ?
    `;

    dbRows = await query(sql, [safeLimit]);
  } catch (err) {
    console.error("getMostReadArticles query error:", err);
  }

  return (dbRows || []).map((row) => {
    const mapped = mapDbArticleToFrontend(row);
    const isWithinWeek = row.is_within_validity_week === 1;
    const loggedWeekViews = Number(row.individual_logged_views) || 0;
    const directViews = Number(row.view_count) || 0;

    const weekViews = isWithinWeek ? Math.max(directViews, loggedWeekViews) : loggedWeekViews;

    return {
      ...mapped,
      view_count: weekViews,
      week_views: weekViews,
      views: weekViews > 0 ? `${weekViews.toLocaleString("bn-BD")} পঠিত` : "সর্বশেষ সংবাদ",
      isWithinValidityWeek: isWithinWeek,
    };
  });
}
