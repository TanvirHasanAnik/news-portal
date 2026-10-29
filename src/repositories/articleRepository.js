import { getDb, query, queryOne, withTransaction } from "@/lib/db";

function normalizeTimestamp(ts) {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  const str = String(ts).trim();
  if (str.includes("T")) {
    return str.endsWith("Z") ? str : `${str}Z`;
  }
  return str.replace(" ", "T") + "Z";
}

export function mapDbArticleToFrontend(dbRow) {
  if (!dbRow) return null;

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
    createdBy:
      dbRow.created_by && dbRow.created_by !== "নিজস্ব প্রতিবেদক"
        ? dbRow.created_by
        : dbRow.author_username || (dbRow.author_id === "usr_superadmin" ? "superadmin" : dbRow.author_id === "usr_admin" ? "admin" : "reporter"),
    created_by:
      dbRow.created_by && dbRow.created_by !== "নিজস্ব প্রতিবেদক"
        ? dbRow.created_by
        : dbRow.author_username || (dbRow.author_id === "usr_superadmin" ? "superadmin" : dbRow.author_id === "usr_admin" ? "admin" : "reporter"),
    lastEditedBy:
      dbRow.last_edited_by &&
      dbRow.last_edited_by !== "নিজস্ব প্রতিবেদক" &&
      dbRow.last_edited_by !== "সম্পাদক"
        ? dbRow.last_edited_by
        : null,
    last_edited_by:
      dbRow.last_edited_by &&
      dbRow.last_edited_by !== "নিজস্ব প্রতিবেদক" &&
      dbRow.last_edited_by !== "সম্পাদক"
        ? dbRow.last_edited_by
        : null,
    lastEditedAt: normalizeTimestamp(dbRow.last_edited_at),
    last_edited_at: dbRow.last_edited_at || null,
    isPassedToUpper: Boolean(dbRow.is_passed_to_upper),
    is_passed_to_upper: Boolean(dbRow.is_passed_to_upper) ? 1 : 0,
    passedBy: dbRow.passed_by || null,
    passed_by: dbRow.passed_by || null,
    passedAt: dbRow.passed_at || null,
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

export async function createArticle(data) {
  const id = data.id || `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const slug = data.slug || `${Date.now()}`;
  const isPublished = data.status === "published";

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

  const createdBy = data.createdBy || data.authorUsername || "reporter";
  const lastEditedBy = data.lastEditedBy || null;

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
      0, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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
    isPublished ? 1 : 0,
  ];

  await withTransaction(async (tx) => {

    await tx.query(insertSql, bindParams);

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

export async function updateArticle(id, data) {
  const current = await getArticleById(id);
  if (!current) {
    throw new Error("সংবাদটি খুঁজে পাওয়া যায়নি");
  }

  const editorUsername = data.lastEditedBy || data.editorUsername || "admin";
  const editorId = data.editorId || current.author_id || "usr_editor";

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

  const isPassedToUpper = data.passToUpper ? 1 : (data.isPassedToUpper !== undefined ? (data.isPassedToUpper ? 1 : 0) : (current.is_passed_to_upper || 0));
  const passedBy = data.passToUpper ? editorUsername : (data.passedBy || current.passed_by || null);

  const normalizeStr = (val) => (val === null || val === undefined ? "" : String(val).trim());
  const normalizeJson = (val) => {
    if (!val) return "[]";
    try {
      const parsed = typeof val === "string" ? JSON.parse(val) : val;
      if (Array.isArray(parsed)) return JSON.stringify(parsed.filter(Boolean));
      return JSON.stringify([String(parsed)]);
    } catch {
      return JSON.stringify([String(val)]);
    }
  };

  const headlineChanged = data.headline !== undefined && normalizeStr(data.headline) !== normalizeStr(current.headline);
  const summaryChanged = data.summary !== undefined && normalizeStr(data.summary) !== normalizeStr(current.summary);
  const contentChanged = data.content !== undefined && normalizeStr(data.content) !== normalizeStr(current.content);
  const categoryChanged = data.categorySlug !== undefined && normalizeStr(data.categorySlug) !== normalizeStr(current.category_slug);
  const subcategoryChanged = data.subcategoryName !== undefined && normalizeStr(data.subcategoryName) !== normalizeStr(current.subcategory_name);
  const imagesChanged = data.images !== undefined && normalizeJson(imagesJson) !== normalizeJson(current.images);
  const imageChanged = data.image !== undefined && normalizeStr(primaryImage) !== normalizeStr(current.image);
  const youtubeChanged = data.youtubeUrl !== undefined && normalizeStr(data.youtubeUrl) !== normalizeStr(current.youtube_url);
  const locationChanged = data.location !== undefined && normalizeStr(data.location) !== normalizeStr(current.location);

  const hasContentChanged =
    headlineChanged ||
    summaryChanged ||
    contentChanged ||
    categoryChanged ||
    subcategoryChanged ||
    imagesChanged ||
    imageChanged ||
    youtubeChanged ||
    locationChanged;

  const lastEditedBy = hasContentChanged ? editorUsername : (current.last_edited_by || null);

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
      last_edited_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE last_edited_at END,
      is_passed_to_upper = ?,
      passed_by = ?,
      passed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE passed_at END,
      published_at = CASE WHEN ? = 1 THEN COALESCE(published_at, CURRENT_TIMESTAMP) ELSE published_at END,
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
    lastEditedBy,
    hasContentChanged ? 1 : 0,
    isPassedToUpper,
    passedBy,
    data.passToUpper ? 1 : 0,
    isNowPublished ? 1 : 0,
    id,
  ];

  await withTransaction(async (tx) => {

    await tx.query(updateSql, bindParams);

    if (hasContentChanged) {
      await tx.query(
        `INSERT INTO article_revisions (id, article_id, editor_id, headline, summary, content, change_summary, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          `rev_${Date.now()}`,
          editorId,
          data.headline || current.headline,
          data.summary || current.summary || "",
          data.content || current.content || "",
          data.changeSummary || `সম্পাদনা করেছেন: ${editorUsername}`,
        ]
      );
    }

    await tx.query(
      `INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `log_${Date.now()}`,
        editorId,
        hasContentChanged ? "edit_article" : (data.passToUpper ? "pass_article" : "review_article"),
        "article",
        id,
        JSON.stringify({
          headline: data.headline || current.headline,
          status: newStatus,
          has_content_changed: hasContentChanged,
          last_edited_by: lastEditedBy,
          passed_to_upper: Boolean(isPassedToUpper),
        }),
      ]
    );

    if (newStatus !== current.status && current.author_id && current.author_id !== editorId) {
      if (newStatus === "published") {
        await tx.query(
          `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
           VALUES (?, ?, 'article_approved', 'সংবাদ অনুমোদিত ও প্রকাশিত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            current.author_id,
            `আপনার সংবাদ "${data.headline || current.headline}" অনুমোদন ও প্রকাশ করা হয়েছে।`,
            id,
            current.slug,
            editorUsername,
          ]
        );
      } else if (newStatus === "rejected") {
        await tx.query(
          `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
           VALUES (?, ?, 'article_rejected', 'সংবাদ প্রত্যাখ্যাত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            current.author_id,
            `আপনার সংবাদ "${data.headline || current.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।`,
            id,
            current.slug,
            editorUsername,
          ]
        );
      }
    }

    if (
      newStatus !== current.status &&
      (current.is_passed_to_upper || isPassedToUpper) &&
      (current.passed_by || passedBy)
    ) {
      const subUsername = current.passed_by || passedBy;
      const subUser = await tx.queryOne(
        "SELECT id, username FROM users WHERE username = ?",
        [subUsername]
      );

      if (subUser && subUser.id !== editorId && subUser.id !== current.author_id) {
        if (newStatus === "published") {
          await tx.query(
            `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
             VALUES (?, ?, 'article_approved', 'যাচাইকৃত সংবাদ অনুমোদিত ও প্রকাশিত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
            [
              `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              subUser.id,
              `আপনার যাচাই ও অগ্রসরকৃত সংবাদ "${data.headline || current.headline}" ঊর্ধ্বতন কর্তৃপক্ষ (@${editorUsername}) কর্তৃক অনুমোদিত ও প্রকাশিত হয়েছে।`,
              id,
              current.slug,
              editorUsername,
            ]
          );
        } else if (newStatus === "rejected") {
          await tx.query(
            `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
             VALUES (?, ?, 'article_rejected', 'যাচাইকৃত সংবাদ প্রত্যাখ্যাত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
            [
              `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              subUser.id,
              `আপনার যাচাইকৃত সংবাদ "${data.headline || current.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।`,
              id,
              current.slug,
              editorUsername,
            ]
          );
        }
      }
    }
  });

  return { id, slug: current.slug, hasContentChanged, lastEditedBy };
}

export async function getArticleById(id) {
  return await queryOne(
    `SELECT a.*, u.role AS author_role, u.username AS author_username
     FROM articles a
     LEFT JOIN users u ON a.author_id = u.id
     WHERE a.id = ?`,
    [id]
  );
}

export async function getArticleBySlug(slug) {
  return await queryOne(
    `SELECT a.*, u.role AS author_role, u.username AS author_username
     FROM articles a
     LEFT JOIN users u ON a.author_id = u.id
     WHERE a.slug = ?`,
    [slug]
  );
}

export async function findArticleBySlugOrId(identifier) {
  if (!identifier) return null;
  const raw = String(identifier).trim();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  let row = await queryOne("SELECT * FROM articles WHERE slug = ?", [decoded]);
  if (row) return row;

  if (decoded !== raw) {
    row = await queryOne("SELECT * FROM articles WHERE slug = ?", [raw]);
    if (row) return row;
  }

  row = await queryOne("SELECT * FROM articles WHERE id = ?", [raw]);
  if (row) return row;

  if (decoded !== raw) {
    row = await queryOne("SELECT * FROM articles WHERE id = ?", [decoded]);
    if (row) return row;
  }

  return null;
}

export async function getPublishedArticles({ categorySlug, limit = 20, offset = 0 } = {}) {
  try {
    const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
    const safeOffset = Math.max(0, Number(offset) || 0);

    if (categorySlug === "handpicked") {
      const rows = await query(
        "SELECT * FROM articles WHERE status = 'published' AND is_handpicked = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [safeLimit, safeOffset]
      );
      return rows || [];
    }

    if (!categorySlug || categorySlug === "all" || categorySlug === "latest") {
      const rows = await query(
        "SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [safeLimit, safeOffset]
      );
      return rows || [];
    }

    const rows = await query(
      "SELECT * FROM articles WHERE status = 'published' AND category_slug = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [categorySlug, safeLimit, safeOffset]
    );
    return rows || [];
  } catch (error) {
    console.error("[Article] Error in getPublishedArticles:", error?.message || error);
    return [];
  }
}

export async function getRecentArticles({ authorId, createdBy, limit = 10 } = {}) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 100);
  const selectCols = `
    a.*, 
    COALESCE(NULLIF(NULLIF(a.created_by, ''), 'নিজস্ব প্রতিবেদক'), u.username, 'reporter') AS created_by,
    NULLIF(TRIM(a.last_edited_by), '') AS last_edited_by,
    a.last_edited_at AS last_edited_at,
    COALESCE(a.is_passed_to_upper, 0) AS is_passed_to_upper,
    a.passed_by AS passed_by,
    a.passed_at AS passed_at
  `;

  if (authorId || createdBy) {
    const rows = await query(
      `SELECT ${selectCols} FROM articles a 
       LEFT JOIN users u ON a.author_id = u.id 
       WHERE (a.author_id = ? OR a.created_by = ? OR u.username = ?) 
       ORDER BY a.created_at DESC LIMIT ?`,
      [authorId || "", createdBy || "", createdBy || "", safeLimit]
    );
    return rows || [];
  }
  const rows = await query(
    `SELECT ${selectCols} FROM articles a 
     LEFT JOIN users u ON a.author_id = u.id 
     ORDER BY a.created_at DESC LIMIT ?`,
    [safeLimit]
  );
  return rows || [];
}

export async function getAllArticles({ status, authorId, createdBy, forSubEditor, limit = 50, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 50), 200);
  const safeOffset = Math.max(0, Number(offset) || 0);

  const conditions = [];
  const params = [];

  if (status && status !== "all") {
    if (status === "pending") {
      conditions.push("(a.status = 'pending' OR a.status = 'pending_approval')");
    } else {
      conditions.push("a.status = ?");
      params.push(status);
    }
  }

  if (forSubEditor && (authorId || createdBy)) {
    conditions.push(
      "((a.author_id = ? OR a.created_by = ? OR u.username = ?) OR ((a.status = 'pending' OR a.status = 'pending_approval') AND (u.role = 'reporter' OR u.role IS NULL)))"
    );
    params.push(authorId || "", createdBy || "", createdBy || "");
  } else if (authorId || createdBy) {
    conditions.push("(a.author_id = ? OR a.created_by = ? OR u.username = ?)");
    params.push(authorId || "", createdBy || "", createdBy || "");
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT a.*, 
           u.role AS author_role,
           COALESCE(NULLIF(NULLIF(a.created_by, ''), 'নিজস্ব প্রতিবেদক'), u.username, 'reporter') AS created_by,
           NULLIF(TRIM(a.last_edited_by), '') AS last_edited_by,
           a.last_edited_at AS last_edited_at,
           COALESCE(a.is_passed_to_upper, 0) AS is_passed_to_upper,
           a.passed_by AS passed_by,
           a.passed_at AS passed_at
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    ${whereClause} 
    ORDER BY a.created_at DESC LIMIT ? OFFSET ?
  `;
  params.push(safeLimit, safeOffset);

  const rows = await query(sql, params);
  return rows || [];
}

export async function deleteArticle(id, editorId = "usr_superadmin", editorUsername = "admin") {
  return await withTransaction(async (tx) => {
    const existing = await tx.query("SELECT headline FROM articles WHERE id = ?", [id]);
    const headline = existing && existing[0]?.headline ? existing[0].headline : "সংবাদ";

    await tx.query("DELETE FROM article_revisions WHERE article_id = ?", [id]);
    await tx.query("DELETE FROM curated_news WHERE article_id = ?", [id]);
    await tx.query("DELETE FROM analytics_page_views WHERE article_id = ?", [id]);
    const result = await tx.query("DELETE FROM articles WHERE id = ?", [id]);

    await tx.query(
      `INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, created_at)
       VALUES (?, ?, 'delete_article', 'article', ?, ?, CURRENT_TIMESTAMP)`,
      [
        `log_${Date.now()}`,
        editorId,
        id,
        JSON.stringify({ headline, last_edited_by: editorUsername }),
      ]
    );

    return result;
  });
}

export async function getArticleAuditLogs(limit = 100) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 100), 200);
  const rows = await query(
    `SELECT l.*, 
            COALESCE(u.username, u.name, 'admin') as user_name, 
            u.email as user_email, 
            u.role as user_role,
            a.headline as article_headline,
            a.slug as article_slug
     FROM audit_logs l
     LEFT JOIN users u ON l.user_id = u.id
     LEFT JOIN articles a ON l.target_id = a.id
     WHERE l.target_type = 'article' 
        OR l.action IN ('create_article', 'edit_article', 'update_status', 'delete_article')
     ORDER BY l.created_at DESC
     LIMIT ?`,
    [safeLimit]
  );
  return rows || [];
}

export async function updateArticleStatus(id, status, editorId = "usr_superadmin", editorUsername = "admin") {
  return await withTransaction(async (tx) => {

    const targetArticle = await tx.queryOne(
      "SELECT id, headline, slug, status, author_id, is_passed_to_upper, passed_by FROM articles WHERE id = ?",
      [id]
    );

    const result = await tx.query(
      `UPDATE articles 
       SET status = ?, 
           published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, CURRENT_TIMESTAMP) ELSE published_at END,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, status, id]
    );

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
        JSON.stringify({ status, changed_by: editorUsername }),
      ]
    );

    if (targetArticle && targetArticle.author_id && targetArticle.author_id !== editorId) {
      if (status === "published") {
        await tx.query(
          `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
           VALUES (?, ?, 'article_approved', 'সংবাদ অনুমোদিত ও প্রকাশিত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            targetArticle.author_id,
            `আপনার সংবাদ "${targetArticle.headline}" অনুমোদন ও প্রকাশ করা হয়েছে।`,
            id,
            targetArticle.slug,
            editorUsername,
          ]
        );
      } else if (status === "rejected") {
        await tx.query(
          `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
           VALUES (?, ?, 'article_rejected', 'সংবাদ প্রত্যাখ্যাত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            targetArticle.author_id,
            `আপনার সংবাদ "${targetArticle.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।`,
            id,
            targetArticle.slug,
            editorUsername,
          ]
        );
      }
    }

    if (targetArticle && targetArticle.is_passed_to_upper && targetArticle.passed_by) {
      const subUser = await tx.queryOne(
        "SELECT id, username FROM users WHERE username = ?",
        [targetArticle.passed_by]
      );

      if (subUser && subUser.id !== editorId && subUser.id !== targetArticle.author_id) {
        if (status === "published") {
          await tx.query(
            `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
             VALUES (?, ?, 'article_approved', 'যাচাইকৃত সংবাদ অনুমোদিত ও প্রকাশিত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
            [
              `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              subUser.id,
              `আপনার যাচাই ও অগ্রসরকৃত সংবাদ "${targetArticle.headline}" ঊর্ধ্বতন কর্তৃপক্ষ (@${editorUsername}) কর্তৃক অনুমোদিত ও প্রকাশিত হয়েছে।`,
              id,
              targetArticle.slug,
              editorUsername,
            ]
          );
        } else if (status === "rejected") {
          await tx.query(
            `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
             VALUES (?, ?, 'article_rejected', 'যাচাইকৃত সংবাদ প্রত্যাখ্যাত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
            [
              `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              subUser.id,
              `আপনার যাচাইকৃত সংবাদ "${targetArticle.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।`,
              id,
              targetArticle.slug,
              editorUsername,
            ]
          );
        }
      }
    }

    return result;
  });
}

export async function passArticleToUpper(id, subEditorUsername = "sub_editor") {
  return await query(
    `UPDATE articles 
     SET is_passed_to_upper = 1,
         passed_by = ?,
         passed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [subEditorUsername, id]
  );
}

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

export async function getPendingArticlesCountForUpperRoles() {
  const row = await queryOne(
    "SELECT COUNT(*) as count FROM articles WHERE status = 'pending' OR status = 'pending_approval'"
  );
  return Number(row?.count || 0);
}

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
