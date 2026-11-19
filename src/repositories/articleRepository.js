import { query, queryOne, withTransaction } from "@/lib/db";
import { deleteMultipleFromR2 } from "@/lib/r2";
import { extractSummaryFromContent } from "@/utils/textUtils";
import { formatArticlePublishDate, isPublishDateHidden } from "@/utils/dateUtils";

function normalizeTimestamp(ts) {
  if (!ts) return null;
  if (ts instanceof Date) return ts.toISOString();
  let str = String(ts).trim();
  if (!str) return null;
  if (/([zZ]|[+-]\d{2}(:?\d{2})?)$/.test(str)) {
    return str;
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
  const rawRepType = dbRow.representative_type;
  let representativeType = rawRepType;
  if (!representativeType) {
    if (dbRow.author_name === "বাসস") {
      representativeType = "bss";
    } else if (dbRow.author_name === "নিজস্ব প্রতিবেদক") {
      representativeType = "reporter";
    } else if (dbRow.author_name === "অনলাইন ডেস্ক") {
      representativeType = "online_desk";
    } else if (dbRow.author_name) {
      representativeType = "custom";
    } else {
      representativeType = "none";
    }
  }

  const rawAuthorName = (dbRow.author_name || "").trim();
  const isUsername =
    Boolean(rawAuthorName) &&
    (rawAuthorName === dbRow.author_username ||
      rawAuthorName === dbRow.created_by ||
      rawAuthorName === "superadmin" ||
      rawAuthorName === "admin" ||
      rawAuthorName === "reporter" ||
      rawAuthorName === "test_reporter" ||
      rawAuthorName === "test_sub_editor");

  let resolvedAuthorName = "";
  if (representativeType === "none" || isUsername) {
    resolvedAuthorName = "";
  } else if (rawAuthorName) {
    resolvedAuthorName = rawAuthorName;
  } else if (rawRepType === "online_desk") {
    resolvedAuthorName = "অনলাইন ডেস্ক";
  } else if (rawRepType === "reporter") {
    resolvedAuthorName = "নিজস্ব প্রতিবেদক";
  } else if (rawRepType === "bss") {
    resolvedAuthorName = "বাসস";
  } else if (rawRepType === "author" && dbRow.author_full_name) {
    resolvedAuthorName = dbRow.author_full_name.trim();
  } else {
    resolvedAuthorName = "";
  }

  const customPublishedAt = normalizeTimestamp(dbRow.custom_published_at);
  const isDateHidden = isPublishDateHidden(dbRow.custom_published_at);
  const fallbackTime = normalizeTimestamp(dbRow.published_at || dbRow.created_at) || null;
  const effectiveTime = isDateHidden ? null : (customPublishedAt || fallbackTime);
  const formattedPublishDate = effectiveTime ? formatArticlePublishDate(effectiveTime) : "";

  const rawSummary = (dbRow.summary || "").trim();
  const headline = (dbRow.curation_custom_title || dbRow.custom_title || dbRow.headline || "").trim();
  const isHeadlineAsSummary = rawSummary && (rawSummary === headline || rawSummary === headline.substring(0, 150));
  const summary = (!isHeadlineAsSummary && rawSummary) || extractSummaryFromContent(dbRow.content, 250);

  return {
    id: dbRow.slug || dbRow.id,
    dbId: dbRow.id,
    slug: dbRow.slug,
    headline: dbRow.headline || "",
    summary,
    content: dbRow.content || "",
    category: dbRow.category_name || "অন্যান্য",
    categorySlug: dbRow.category_slug || "others",
    category_name: dbRow.category_name || "অন্যান্য",
    category_slug: dbRow.category_slug || "others",
    subcategory: dbRow.subcategory_name || null,
    subcategorySlug: dbRow.subcategory_name ? encodeURIComponent(dbRow.subcategory_name) : null,
    image: primaryImage,
    images: imagesArray,
    youtubeUrl: dbRow.youtube_url || null,
    author: resolvedAuthorName,
    authorId: dbRow.author_id || null,
    authorName: resolvedAuthorName,
    representativeType,
    representative_type: representativeType,
    authorFullName: dbRow.author_full_name || null,
    author_full_name: dbRow.author_full_name || null,
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
    last_edited_at: normalizeTimestamp(dbRow.last_edited_at),
    isPassedToUpper: Boolean(dbRow.is_passed_to_upper),
    is_passed_to_upper: Boolean(dbRow.is_passed_to_upper) ? 1 : 0,
    passedBy: dbRow.passed_by || null,
    passed_by: dbRow.passed_by || null,
    passedAt: normalizeTimestamp(dbRow.passed_at),
    passed_at: normalizeTimestamp(dbRow.passed_at),
    location: dbRow.location || "",
    time: effectiveTime,
    publishedAt: fallbackTime,
    customPublishedAt,
    custom_published_at: customPublishedAt,
    isDateHidden,
    formattedPublishDate,
    createdAt: normalizeTimestamp(dbRow.created_at),
    created_at: normalizeTimestamp(dbRow.created_at),
    updatedAt: normalizeTimestamp(dbRow.updated_at || dbRow.created_at),
    updated_at: normalizeTimestamp(dbRow.updated_at || dbRow.created_at),
    rejectionReason: (dbRow.rejection_reason || "").trim() || null,
    rejection_reason: (dbRow.rejection_reason || "").trim() || null,
    hasCustomImage: Boolean(primaryImage),
    status: dbRow.status === "pending_approval" ? "pending" : (dbRow.status || "published"),
    isLead: Boolean(dbRow.is_lead),
    isBreaking: Boolean(dbRow.is_breaking),
    isHandpicked: Boolean(
      dbRow.is_handpicked ||
      (dbRow.curation_priority !== undefined && dbRow.curation_priority !== null)
    ),
  };
}

export const PUBLIC_ARTICLE_COLUMNS = [
  "id",
  "headline",
  "slug",
  "summary",
  "category_id",
  "category_name",
  "category_slug",
  "subcategory_id",
  "subcategory_name",
  "images",
  "image",
  "youtube_url",
  "author_name",
  "representative_type",
  "location",
  "read_time",
  "status",
  "is_breaking",
  "is_lead",
  "is_handpicked",
  "view_count",
  "published_at",
  "custom_published_at",
  "created_at",
  "updated_at",
];

export const PUBLIC_ARTICLE_SELECT_FIELDS = PUBLIC_ARTICLE_COLUMNS.join(", ");
export const PUBLIC_ARTICLE_SELECT_FIELDS_ALIASED = PUBLIC_ARTICLE_COLUMNS.map((col) => `a.${col}`).join(", ");

export function toPublicArticleSummary(dbRow) {
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
  const rawRepType = dbRow.representative_type || dbRow.representativeType;
  let representativeType = rawRepType;
  if (!representativeType) {
    if (dbRow.author_name === "বাসস") {
      representativeType = "bss";
    } else if (dbRow.author_name === "নিজস্ব প্রতিবেদক") {
      representativeType = "reporter";
    } else if (dbRow.author_name === "অনলাইন ডেস্ক") {
      representativeType = "online_desk";
    } else if (dbRow.author_name) {
      representativeType = "custom";
    } else {
      representativeType = "none";
    }
  }

  const rawAuthorName = (dbRow.author_name || dbRow.authorName || dbRow.author || "").trim();
  const isUsername =
    Boolean(rawAuthorName) &&
    (rawAuthorName === dbRow.author_username ||
      rawAuthorName === dbRow.created_by ||
      rawAuthorName === dbRow.createdBy ||
      rawAuthorName === "superadmin" ||
      rawAuthorName === "admin" ||
      rawAuthorName === "reporter" ||
      rawAuthorName === "test_reporter" ||
      rawAuthorName === "test_sub_editor");

  let resolvedAuthorName = "";
  if (representativeType === "none" || isUsername) {
    resolvedAuthorName = "";
  } else if (rawAuthorName) {
    resolvedAuthorName = rawAuthorName;
  } else if (rawRepType === "online_desk") {
    resolvedAuthorName = "অনলাইন ডেস্ক";
  } else if (rawRepType === "reporter") {
    resolvedAuthorName = "নিজস্ব প্রতিবেদক";
  } else if (rawRepType === "bss") {
    resolvedAuthorName = "বাসস";
  } else if (rawRepType === "author" && dbRow.author_full_name) {
    resolvedAuthorName = dbRow.author_full_name.trim();
  } else {
    resolvedAuthorName = "";
  }

  const customPublishedAt = normalizeTimestamp(dbRow.custom_published_at || dbRow.customPublishedAt);
  const isDateHidden = isPublishDateHidden(dbRow.custom_published_at || dbRow.customPublishedAt);
  const fallbackTime = normalizeTimestamp(dbRow.published_at || dbRow.publishedAt || dbRow.created_at || dbRow.createdAt) || null;
  const effectiveTime = isDateHidden ? null : (customPublishedAt || fallbackTime);
  const formattedPublishDate = effectiveTime ? formatArticlePublishDate(effectiveTime) : "";

  const rawSummary = (dbRow.summary || "").trim();
  const headline = (dbRow.curation_custom_title || dbRow.custom_title || dbRow.headline || "").trim();
  const isHeadlineAsSummary = rawSummary && (rawSummary === headline || rawSummary === headline.substring(0, 150));
  const summary = (!isHeadlineAsSummary && rawSummary) || (dbRow.content ? extractSummaryFromContent(dbRow.content, 250) : "");

  const result = {
    id: dbRow.slug || dbRow.id,
    dbId: dbRow.id || dbRow.dbId,
    slug: dbRow.slug,
    headline,
    summary,
    category: dbRow.category_name || dbRow.category || "অন্যান্য",
    categorySlug: dbRow.category_slug || dbRow.categorySlug || "others",
    category_name: dbRow.category_name || dbRow.category || "অন্যান্য",
    category_slug: dbRow.category_slug || dbRow.categorySlug || "others",
    subcategory: dbRow.subcategory_name || dbRow.subcategory || null,
    subcategorySlug: dbRow.subcategory_name ? encodeURIComponent(dbRow.subcategory_name) : (dbRow.subcategory ? encodeURIComponent(dbRow.subcategory) : null),
    image: primaryImage,
    images: imagesArray,
    youtubeUrl: dbRow.youtube_url || dbRow.youtubeUrl || null,
    author: resolvedAuthorName,
    authorName: resolvedAuthorName,
    representativeType,
    representative_type: representativeType,
    location: dbRow.location || "",
    readTime: dbRow.read_time || dbRow.readTime || "৩ মিনিট পাঠ",
    read_time: dbRow.read_time || dbRow.readTime || "৩ মিনিট পাঠ",
    time: effectiveTime,
    publishedAt: fallbackTime,
    customPublishedAt,
    custom_published_at: customPublishedAt,
    isDateHidden,
    formattedPublishDate,
    createdAt: normalizeTimestamp(dbRow.created_at || dbRow.createdAt),
    created_at: normalizeTimestamp(dbRow.created_at || dbRow.createdAt),
    updatedAt: normalizeTimestamp(dbRow.updated_at || dbRow.updatedAt || dbRow.created_at || dbRow.createdAt),
    updated_at: normalizeTimestamp(dbRow.updated_at || dbRow.updatedAt || dbRow.created_at || dbRow.createdAt),
    hasCustomImage: Boolean(primaryImage),
    status: dbRow.status === "pending_approval" ? "pending" : (dbRow.status || "published"),
    isLead: Boolean(dbRow.is_lead ?? dbRow.isLead),
    isBreaking: Boolean(dbRow.is_breaking ?? dbRow.isBreaking),
    isHandpicked: Boolean(
      dbRow.is_handpicked ??
      dbRow.isHandpicked ??
      (dbRow.curation_priority !== undefined && dbRow.curation_priority !== null)
    ),
  };

  if (dbRow.curationId || dbRow.curation_id) {
    result.curationId = dbRow.curationId || dbRow.curation_id;
  }
  if (dbRow.view_count !== undefined && dbRow.view_count !== null) {
    result.view_count = Number(dbRow.view_count);
  }
  if (dbRow.week_views !== undefined && dbRow.week_views !== null) {
    result.week_views = Number(dbRow.week_views);
  }
  if (dbRow.views) {
    result.views = dbRow.views;
  }
  if (dbRow.isWithinValidityWeek !== undefined && dbRow.isWithinValidityWeek !== null) {
    result.isWithinValidityWeek = Boolean(dbRow.isWithinValidityWeek);
  }

  return result;
}

export function toPublicArticleDetail(dbRow) {
  if (!dbRow) return null;
  const summary = toPublicArticleSummary(dbRow);
  return {
    ...summary,
    content: dbRow.content || "",
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

  const representativeType = data.representativeType || (data.authorName ? "custom" : "none");
  let authorName = data.authorName !== undefined ? data.authorName : "";
  if (representativeType === "none") {
    authorName = "";
  } else if (!authorName) {
    if (representativeType === "online_desk") authorName = "অনলাইন ডেস্ক";
    else if (representativeType === "reporter") authorName = "নিজস্ব প্রতিবেদক";
    else if (representativeType === "bss") authorName = "বাসস";
    else authorName = "";
  }

  const customPublishedAt = data.customPublishedAt || null;
  const location = data.location !== undefined ? (data.location ? String(data.location).trim() : null) : null;

  const insertSql = `
    INSERT INTO articles (
      id, headline, slug, summary, content,
      category_id, category_name, category_slug,
      subcategory_id, subcategory_name,
      images, image, youtube_url,
      author_id, author_name, representative_type, location, read_time,
      status, is_breaking, is_lead, is_handpicked,
      created_by, last_edited_by,
      view_count, published_at, custom_published_at, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      0,
      CASE
        WHEN ? IS NOT NULL THEN ?
        WHEN ? = 1 THEN CURRENT_TIMESTAMP
        ELSE NULL
      END,
      ?,
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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
    authorName,
    representativeType,
    location,
    data.readTime || "৩ মিনিট পাঠ",
    data.status || "published",
    data.isBreaking ? 1 : 0,
    data.isLead ? 1 : 0,
    data.isHandpicked ? 1 : 0,
    createdBy,
    lastEditedBy,
    customPublishedAt,
    customPublishedAt,
    isPublished ? 1 : 0,
    customPublishedAt,
  ];

  await withTransaction(async (tx) => {

    await tx.query(insertSql, bindParams);

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
  const representativeTypeChanged = data.representativeType !== undefined && data.representativeType !== current.representative_type;
  const authorNameChanged = data.authorName !== undefined && normalizeStr(data.authorName) !== normalizeStr(current.author_name);
  const customPublishedAtChanged = data.customPublishedAt !== undefined && normalizeStr(data.customPublishedAt) !== normalizeStr(current.custom_published_at);

  const hasContentChanged =
    headlineChanged ||
    summaryChanged ||
    contentChanged ||
    categoryChanged ||
    subcategoryChanged ||
    imagesChanged ||
    imageChanged ||
    youtubeChanged ||
    locationChanged ||
    representativeTypeChanged ||
    authorNameChanged ||
    customPublishedAtChanged;

  const lastEditedBy = hasContentChanged ? editorUsername : (current.last_edited_by || null);

  const newRepresentativeType = data.representativeType !== undefined ? data.representativeType : (current.representative_type || "online_desk");
  let newAuthorName = current.author_name;
  if (data.authorName !== undefined) {
    newAuthorName = newRepresentativeType === "none" ? "" : data.authorName;
  } else if (newRepresentativeType === "none") {
    newAuthorName = "";
  }
  const newCustomPublishedAt = data.customPublishedAt !== undefined ? (data.customPublishedAt || null) : current.custom_published_at;
  const newLocation = data.location !== undefined ? (data.location ? String(data.location).trim() : null) : current.location;

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
      author_name = ?,
      representative_type = ?,
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
      published_at = CASE
        WHEN ? IS NOT NULL THEN ?
        WHEN ? = 1 THEN COALESCE(published_at, CURRENT_TIMESTAMP)
        ELSE published_at
      END,
      custom_published_at = ?,
      rejection_reason = ?,
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
    newAuthorName,
    newRepresentativeType,
    newLocation,
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
    newCustomPublishedAt,
    newCustomPublishedAt,
    isNowPublished ? 1 : 0,
    newCustomPublishedAt,
    newStatus === "rejected" ? (data.rejectionReason || current.rejection_reason || null) : null,
    id,
  ];

  await withTransaction(async (tx) => {

    await tx.query(updateSql, bindParams);

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
        const rejectMsg = data.rejectionReason
          ? `আপনার সংবাদ "${data.headline || current.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।\nমন্তব্য/কারণ: ${data.rejectionReason}`
          : `আপনার সংবাদ "${data.headline || current.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।`;

        await tx.query(
          `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
           VALUES (?, ?, 'article_rejected', 'সংবাদ প্রত্যাখ্যাত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            current.author_id,
            rejectMsg,
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
          const rejectMsg = data.rejectionReason
            ? `আপনার যাচাইকৃত সংবাদ "${data.headline || current.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।\nমন্তব্য/কারণ: ${data.rejectionReason}`
            : `আপনার যাচাইকৃত সংবাদ "${data.headline || current.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।`;

          await tx.query(
            `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
             VALUES (?, ?, 'article_rejected', 'যাচাইকৃত সংবাদ প্রত্যাখ্যাত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
            [
              `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              subUser.id,
              rejectMsg,
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
    `SELECT a.*, u.role AS author_role, u.username AS author_username, u.full_name AS author_full_name
     FROM articles a
     LEFT JOIN users u ON a.author_id = u.id
     WHERE a.id = ?`,
    [id]
  );
}

export async function getArticleBySlug(slug) {
  return await queryOne(
    `SELECT a.*, u.role AS author_role, u.username AS author_username, u.full_name AS author_full_name
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

  const findBySlugSql = `
    SELECT a.*, u.role AS author_role, u.username AS author_username, u.full_name AS author_full_name
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.slug = ?
  `;

  let row = await queryOne(findBySlugSql, [decoded]);
  if (row) return row;

  if (decoded !== raw) {
    row = await queryOne(findBySlugSql, [raw]);
    if (row) return row;
  }

  const findByIdSql = `
    SELECT a.*, u.role AS author_role, u.username AS author_username, u.full_name AS author_full_name
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.id = ?
  `;

  row = await queryOne(findByIdSql, [raw]);
  if (row) return row;

  if (decoded !== raw) {
    row = await queryOne(findByIdSql, [decoded]);
    if (row) return row;
  }

  return null;
}

export async function getPublishedArticles({ categorySlug, subcategoryName, limit = 20, offset = 0 } = {}) {
  try {
    const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
    const safeOffset = Math.max(0, Number(offset) || 0);

    if (categorySlug === "handpicked") {
      const conditions = [
        "a.status = 'published'",
        "(c.article_id IS NOT NULL OR (a.is_handpicked = 1 AND a.id NOT IN (SELECT article_id FROM curated_news WHERE type = 'handpicked' AND is_active = 0 AND article_id IS NOT NULL)))",
      ];
      const params = [];

      if (subcategoryName) {
        conditions.push("a.subcategory_name = ?");
        params.push(subcategoryName);
      }

      const sql = `
        SELECT ${PUBLIC_ARTICLE_SELECT_FIELDS_ALIASED}, c.priority AS curation_priority, c.custom_title AS curation_custom_title
        FROM articles a
        LEFT JOIN (
          SELECT article_id, MAX(priority) AS priority, MAX(custom_title) AS custom_title, MAX(created_at) AS created_at
          FROM curated_news
          WHERE type = 'handpicked' AND is_active = 1
          GROUP BY article_id
        ) c ON c.article_id = a.id
        WHERE ${conditions.join(" AND ")}
        ORDER BY 
          (c.article_id IS NOT NULL) DESC,
          c.priority DESC,
          c.created_at DESC,
          COALESCE(NULLIF(a.custom_published_at, '1970-01-01 00:00:01'), a.published_at, a.created_at) DESC
        LIMIT ? OFFSET ?
      `;
      params.push(safeLimit, safeOffset);

      const rows = await query(sql, params);
      return (rows || []).map(toPublicArticleSummary);
    }

    const conditions = ["status = 'published'"];
    const params = [];

    if (categorySlug && categorySlug !== "all" && categorySlug !== "latest") {
      conditions.push("category_slug = ?");
      params.push(categorySlug);
    }

    if (subcategoryName) {
      conditions.push("subcategory_name = ?");
      params.push(subcategoryName);
    }

    const sql = `
      SELECT ${PUBLIC_ARTICLE_SELECT_FIELDS} FROM articles
      WHERE ${conditions.join(" AND ")}
      ORDER BY COALESCE(NULLIF(custom_published_at, '1970-01-01 00:00:01'), published_at, created_at) DESC
      LIMIT ? OFFSET ?
    `;
    params.push(safeLimit, safeOffset);

    const rows = await query(sql, params);
    return (rows || []).map(toPublicArticleSummary);
  } catch (error) {
    console.error("[Article] Error in getPublishedArticles:", error?.message || error);
    return [];
  }
}

export async function getPublishedArticlesCount({ categorySlug, subcategoryName } = {}) {
  try {
    if (categorySlug === "handpicked") {
      const conditions = [
        "a.status = 'published'",
        "(c.article_id IS NOT NULL OR (a.is_handpicked = 1 AND a.id NOT IN (SELECT article_id FROM curated_news WHERE type = 'handpicked' AND is_active = 0 AND article_id IS NOT NULL)))",
      ];
      const params = [];

      if (subcategoryName) {
        conditions.push("a.subcategory_name = ?");
        params.push(subcategoryName);
      }

      const sql = `
        SELECT COUNT(*) as count FROM articles a
        LEFT JOIN (
          SELECT article_id
          FROM curated_news
          WHERE type = 'handpicked' AND is_active = 1
          GROUP BY article_id
        ) c ON c.article_id = a.id
        WHERE ${conditions.join(" AND ")}
      `;

      const row = await queryOne(sql, params);
      return Number(row?.count || 0);
    }

    const conditions = ["status = 'published'"];
    const params = [];

    if (categorySlug && categorySlug !== "all" && categorySlug !== "latest") {
      conditions.push("category_slug = ?");
      params.push(categorySlug);
    }

    if (subcategoryName) {
      conditions.push("subcategory_name = ?");
      params.push(subcategoryName);
    }

    const sql = `
      SELECT COUNT(*) as count FROM articles
      WHERE ${conditions.join(" AND ")}
    `;

    const row = await queryOne(sql, params);
    return Number(row?.count || 0);
  } catch (error) {
    console.error("[Article] Error in getPublishedArticlesCount:", error?.message || error);
    return 0;
  }
}

export async function getPublishedSubcategories(categorySlug) {
  try {
    if (!categorySlug || categorySlug === "all" || categorySlug === "latest" || categorySlug === "handpicked") {
      return [];
    }
    const rows = await query(
      "SELECT DISTINCT subcategory_name FROM articles WHERE category_slug = ? AND subcategory_name IS NOT NULL AND status = 'published' ORDER BY subcategory_name ASC",
      [categorySlug]
    );
    return (rows || []).map((r) => r.subcategory_name).filter(Boolean);
  } catch (error) {
    console.error("[Article] Error in getPublishedSubcategories:", error?.message || error);
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

function buildArticleFilterConditions({
  status,
  categorySlug,
  search,
  authorId,
  createdBy,
  forSubEditor,
  activeView,
  isReporter,
  isLower,
} = {}) {
  const conditions = [];
  const params = [];

  if (isReporter) {
    conditions.push("(a.author_id = ? OR a.created_by = ? OR u.username = ?)");
    params.push(authorId || "", createdBy || "", createdBy || "");
  } else if (forSubEditor) {
    if (activeView === "reporters") {
      conditions.push("(a.author_id != ? AND (a.created_by != ? OR a.created_by IS NULL) AND (u.username != ? OR u.username IS NULL))");
      params.push(authorId || "", createdBy || "", createdBy || "");
      conditions.push("((a.status = 'pending' OR a.status = 'pending_approval') AND (u.role = 'reporter' OR u.role IS NULL OR a.is_passed_to_upper = 1))");
    } else if (activeView === "my") {
      conditions.push("(a.author_id = ? OR a.created_by = ? OR u.username = ?)");
      params.push(authorId || "", createdBy || "", createdBy || "");
    } else {
      conditions.push(
        "((a.author_id = ? OR a.created_by = ? OR u.username = ?) OR ((a.status = 'pending' OR a.status = 'pending_approval') AND (u.role = 'reporter' OR u.role IS NULL)))"
      );
      params.push(authorId || "", createdBy || "", createdBy || "");
    }
  } else if (isLower) {
    conditions.push("(a.author_id = ? OR a.created_by = ? OR u.username = ?)");
    params.push(authorId || "", createdBy || "", createdBy || "");
  } else {
    if (activeView === "my") {
      conditions.push("(a.author_id = ? OR a.created_by = ? OR u.username = ?)");
      params.push(authorId || "", createdBy || "", createdBy || "");
      conditions.push("a.status != 'rejected'");
    } else {
      conditions.push("(a.status != 'draft' OR a.author_id = ? OR a.created_by = ? OR u.username = ?)");
      params.push(authorId || "", createdBy || "", createdBy || "");
    }
  }

  if (status && status !== "all") {
    if (status === "pending") {
      conditions.push("(a.status = 'pending' OR a.status = 'pending_approval')");
    } else {
      conditions.push("a.status = ?");
      params.push(status);
    }
  }

  if (categorySlug && categorySlug !== "all") {
    conditions.push("a.category_slug = ?");
    params.push(categorySlug);
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    conditions.push("(LOWER(a.headline) LIKE ? OR LOWER(a.author_name) LIKE ? OR LOWER(a.created_by) LIKE ?)");
    params.push(term, term, term);
  }

  return { conditions, params };
}

export async function getAllArticles(options = {}) {
  const {
    limit = 20,
    offset = 0,
  } = options;
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 200);
  const safeOffset = Math.max(0, Number(offset) || 0);

  const { conditions, params } = buildArticleFilterConditions(options);
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
  const queryParams = [...params, safeLimit, safeOffset];

  const rows = await query(sql, queryParams);
  return rows || [];
}

export async function getAllArticlesCount(options = {}) {
  const { conditions, params } = buildArticleFilterConditions(options);
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT COUNT(*) as total
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    ${whereClause}
  `;
  const row = await queryOne(sql, params);
  return Number(row?.total || 0);
}

function extractArticleImages(row) {
  if (!row) return [];
  const imageSet = new Set();
  if (row.image) imageSet.add(row.image);

  if (Array.isArray(row.images)) {
    row.images.filter(Boolean).forEach((img) => imageSet.add(img));
  } else if (typeof row.images === "string" && row.images.trim()) {
    try {
      const parsed = JSON.parse(row.images);
      if (Array.isArray(parsed)) {
        parsed.filter(Boolean).forEach((img) => imageSet.add(img));
      } else if (parsed && typeof parsed === "string") {
        imageSet.add(parsed);
      }
    } catch {
      imageSet.add(row.images.trim());
    }
  }

  if (typeof row.content === "string" && row.content) {
    const apiMatches = row.content.match(/\/api\/images\/[^\s"'<>)]+/g) || [];
    apiMatches.forEach((m) => imageSet.add(m));

    const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (r2PublicUrl) {
      const escapedBase = r2PublicUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const publicMatches = row.content.match(new RegExp(`${escapedBase}/[^\\s"'<>)]+`, "g")) || [];
      publicMatches.forEach((m) => imageSet.add(m));
    }
  }

  return Array.from(imageSet);
}

export async function deleteArticle(id, editorId = "usr_superadmin", editorUsername = "admin") {
  let imagesToDelete = [];

  const result = await withTransaction(async (tx) => {
    const existing = await tx.query("SELECT headline, image, images, content FROM articles WHERE id = ?", [id]);
    const row = existing && existing[0] ? existing[0] : null;
    const headline = row?.headline || "সংবাদ";

    if (row) {
      imagesToDelete = extractArticleImages(row);
    }

    await tx.query("DELETE FROM curated_news WHERE article_id = ?", [id]);
    await tx.query("DELETE FROM analytics_page_views WHERE article_id = ?", [id]);
    await tx.query("DELETE FROM article_revisions WHERE article_id = ?", [id]);
    const deleteResult = await tx.query("DELETE FROM articles WHERE id = ?", [id]);

    await tx.query(
      `INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, created_at)
       VALUES (?, ?, 'delete_article', 'article', ?, ?, CURRENT_TIMESTAMP)`,
      [
        `log_${Date.now()}`,
        editorId,
        id,
        JSON.stringify({ headline, last_edited_by: editorUsername, images_deleted: imagesToDelete.length }),
      ]
    );

    return deleteResult;
  });

  if (imagesToDelete.length > 0) {
    try {
      await deleteMultipleFromR2(imagesToDelete);
    } catch (err) {
      console.error("Failed to delete images from R2 for article", id, err);
    }
  }

  return result;
}

export async function cleanupExpiredOnlineDeskArticles({
  daysOld = 30,
  minRetentionCount = 10,
  batchSize = 50,
  operatorId = "usr_superadmin",
  operatorUsername = "system",
} = {}) {
  let totalDeletedCount = 0;
  let totalImagesDeleted = 0;

  const latestRows = await query(
    "SELECT id FROM articles ORDER BY created_at DESC LIMIT ?",
    [Number(minRetentionCount) || 10]
  );
  const protectedIds = (latestRows || []).map((r) => r.id).filter(Boolean);

  while (true) {
    let sql = `
      SELECT id, headline, image, images, content
      FROM articles
      WHERE representative_type = 'online_desk'
        AND created_at <= NOW() - INTERVAL ? DAY
    `;
    const params = [Number(daysOld) || 30];

    if (protectedIds.length > 0) {
      const placeholders = protectedIds.map(() => "?").join(",");
      sql += ` AND id NOT IN (${placeholders})`;
      params.push(...protectedIds);
    }

    sql += ` ORDER BY created_at ASC LIMIT ?`;
    params.push(Number(batchSize) || 50);

    const rows = await query(sql, params);
    if (!rows || rows.length === 0) {
      break;
    }

    const batchIds = rows.map((r) => r.id);
    const imagesToDeleteSet = new Set();
    for (const r of rows) {
      const imgs = extractArticleImages(r);
      imgs.forEach((img) => imagesToDeleteSet.add(img));
    }
    const batchImagesToDelete = Array.from(imagesToDeleteSet);

    await withTransaction(async (tx) => {
      const placeholders = batchIds.map(() => "?").join(",");
      await tx.query(`DELETE FROM curated_news WHERE article_id IN (${placeholders})`, batchIds);
      await tx.query(`DELETE FROM analytics_page_views WHERE article_id IN (${placeholders})`, batchIds);
      await tx.query(`DELETE FROM article_revisions WHERE article_id IN (${placeholders})`, batchIds);
      await tx.query(`DELETE FROM articles WHERE id IN (${placeholders})`, batchIds);

      await tx.query(
        `INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, created_at)
         VALUES (?, ?, 'cleanup_expired_articles', 'article', ?, ?, CURRENT_TIMESTAMP)`,
        [
          `log_cleanup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          operatorId,
          `batch_${Date.now()}`,
          JSON.stringify({
            deleted_count: batchIds.length,
            images_deleted: batchImagesToDelete.length,
            operator: operatorUsername,
            representative_type: "online_desk",
          }),
        ]
      );
    });

    if (batchImagesToDelete.length > 0) {
      try {
        await deleteMultipleFromR2(batchImagesToDelete);
      } catch (err) {
        console.error("Failed to delete images from R2 in batch cleanup:", err);
      }
    }

    totalDeletedCount += batchIds.length;
    totalImagesDeleted += batchImagesToDelete.length;

    if (rows.length < (Number(batchSize) || 50)) {
      break;
    }
  }

  if (totalDeletedCount > 0) {
    try {
      invalidateHomepage();
    } catch (_e) {}
  }

  return {
    success: true,
    deletedCount: totalDeletedCount,
    imagesDeleted: totalImagesDeleted,
  };
}

export async function getExpiredOnlineDeskArticlesCount({
  daysOld = 30,
  minRetentionCount = 10,
} = {}) {
  const latestRows = await query(
    "SELECT id FROM articles ORDER BY created_at DESC LIMIT ?",
    [Number(minRetentionCount) || 10]
  );
  const protectedIds = (latestRows || []).map((r) => r.id).filter(Boolean);

  let sql = `
    SELECT COUNT(*) AS total
    FROM articles
    WHERE representative_type = 'online_desk'
      AND created_at <= NOW() - INTERVAL ? DAY
  `;
  const params = [Number(daysOld) || 30];

  if (protectedIds.length > 0) {
    const placeholders = protectedIds.map(() => "?").join(",");
    sql += ` AND id NOT IN (${placeholders})`;
    params.push(...protectedIds);
  }

  const result = await queryOne(sql, params);
  return Number(result?.total || 0);
}

export async function getArticleAuditLogs(optionsOrLimit = 20, optionalOffset = 0) {
  let limit = 20;
  let offset = 0;
  let action = "all";
  let search = "";

  if (typeof optionsOrLimit === "number") {
    limit = optionsOrLimit;
    offset = optionalOffset || 0;
  } else if (optionsOrLimit && typeof optionsOrLimit === "object") {
    limit = optionsOrLimit.limit || 20;
    offset = optionsOrLimit.offset || 0;
    action = optionsOrLimit.action || "all";
    search = optionsOrLimit.search || "";
  }

  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 200);
  const safeOffset = Math.max(0, Number(offset) || 0);

  const conditions = [
    "(l.target_type = 'article' OR l.action IN ('create_article', 'edit_article', 'update_status', 'delete_article'))",
  ];
  const params = [];

  if (action && action !== "all") {
    conditions.push("l.action = ?");
    params.push(action);
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    conditions.push(
      "(LOWER(COALESCE(a.headline, '')) LIKE ? OR LOWER(COALESCE(u.username, u.name, '')) LIKE ? OR LOWER(l.action) LIKE ? OR LOWER(COALESCE(l.details, '')) LIKE ?)"
    );
    params.push(term, term, term, term);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const sql = `
    SELECT l.*, 
           COALESCE(u.username, u.name, 'admin') as user_name, 
           u.email as user_email, 
           u.role as user_role,
           a.headline as article_headline,
           a.slug as article_slug
    FROM audit_logs l
    LEFT JOIN users u ON l.user_id = u.id
    LEFT JOIN articles a ON l.target_id = a.id
    ${whereClause}
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await query(sql, [...params, safeLimit, safeOffset]);
  return rows || [];
}

export async function getArticleAuditLogsCount(options = {}) {
  let action = "all";
  let search = "";

  if (options && typeof options === "object") {
    action = options.action || "all";
    search = options.search || "";
  }

  const conditions = [
    "(l.target_type = 'article' OR l.action IN ('create_article', 'edit_article', 'update_status', 'delete_article'))",
  ];
  const params = [];

  if (action && action !== "all") {
    conditions.push("l.action = ?");
    params.push(action);
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    conditions.push(
      "(LOWER(COALESCE(a.headline, '')) LIKE ? OR LOWER(COALESCE(u.username, u.name, '')) LIKE ? OR LOWER(l.action) LIKE ? OR LOWER(COALESCE(l.details, '')) LIKE ?)"
    );
    params.push(term, term, term, term);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const sql = `
    SELECT COUNT(*) as total
    FROM audit_logs l
    LEFT JOIN users u ON l.user_id = u.id
    LEFT JOIN articles a ON l.target_id = a.id
    ${whereClause}
  `;
  const row = await queryOne(sql, params);
  return Number(row?.total || 0);
}

export async function updateArticleStatus(id, status, editorId = "usr_superadmin", editorUsername = "admin", rejectionReason = null) {
  return await withTransaction(async (tx) => {

    const targetArticle = await tx.queryOne(
      "SELECT id, headline, slug, status, author_id, category_id, category_slug, is_passed_to_upper, passed_by FROM articles WHERE id = ?",
      [id]
    );

    let fallbackCategory = null;
    if (status === "published" && targetArticle) {
      let catExists = false;
      if (targetArticle.category_id) {
        const cat = await tx.queryOne("SELECT id FROM categories WHERE id = ?", [targetArticle.category_id]);
        if (cat) catExists = true;
      } else if (targetArticle.category_slug) {
        const cat = await tx.queryOne("SELECT id FROM categories WHERE slug = ?", [targetArticle.category_slug]);
        if (cat) catExists = true;
      }
      if (!catExists) {
        const fb = await tx.queryOne("SELECT id, name, slug FROM categories WHERE slug = 'others' OR id = 'cat_others'");
        fallbackCategory = fb || { id: "cat_others", name: "অন্যান্য", slug: "others" };
      }
    }

    const cleanReason = (rejectionReason || "").trim();

    const result = await tx.query(
      `UPDATE articles 
       SET status = ?, 
           rejection_reason = ?,
           category_id = CASE WHEN ? = 1 THEN ? ELSE category_id END,
           category_name = CASE WHEN ? = 1 THEN ? ELSE category_name END,
           category_slug = CASE WHEN ? = 1 THEN ? ELSE category_slug END,
           subcategory_id = CASE WHEN ? = 1 THEN NULL ELSE subcategory_id END,
           subcategory_name = CASE WHEN ? = 1 THEN NULL ELSE subcategory_name END,
           published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, CURRENT_TIMESTAMP) ELSE published_at END,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        status,
        status === "rejected" ? (cleanReason || null) : null,
        fallbackCategory ? 1 : 0,
        fallbackCategory?.id || null,
        fallbackCategory ? 1 : 0,
        fallbackCategory?.name || null,
        fallbackCategory ? 1 : 0,
        fallbackCategory?.slug || null,
        fallbackCategory ? 1 : 0,
        fallbackCategory ? 1 : 0,
        status,
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
        JSON.stringify({ status, changed_by: editorUsername, rejection_reason: cleanReason || null }),
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
        const rejectMsg = cleanReason
          ? `আপনার সংবাদ "${targetArticle.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।\nমন্তব্য/কারণ: ${cleanReason}`
          : `আপনার সংবাদ "${targetArticle.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।`;

        await tx.query(
          `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
           VALUES (?, ?, 'article_rejected', 'সংবাদ প্রত্যাখ্যাত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            targetArticle.author_id,
            rejectMsg,
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
          const rejectMsg = cleanReason
            ? `আপনার যাচাইকৃত সংবাদ "${targetArticle.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।\nমন্তব্য/কারণ: ${cleanReason}`
            : `আপনার যাচাইকৃত সংবাদ "${targetArticle.headline}" ঊর্ধ্বতন কর্তৃপক্ষের পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।`;

          await tx.query(
            `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
             VALUES (?, ?, 'article_rejected', 'যাচাইকৃত সংবাদ প্রত্যাখ্যাত হয়েছে', ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
            [
              `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              subUser.id,
              rejectMsg,
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
      SELECT ${PUBLIC_ARTICLE_SELECT_FIELDS_ALIASED},
             CASE 
               WHEN COALESCE(NULLIF(a.custom_published_at, '1970-01-01 00:00:01'), a.published_at, a.created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 
               ELSE 0 
             END as is_within_validity_week,
             CASE 
               WHEN COALESCE(NULLIF(a.custom_published_at, '1970-01-01 00:00:01'), a.published_at, a.created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 
                 GREATEST(
                   COALESCE(a.view_count, 0),
                   (
                     SELECT COUNT(*) 
                     FROM analytics_page_views v 
                     WHERE v.article_id = a.id 
                       AND v.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                   )
                 )
               ELSE 
                 (
                   SELECT COUNT(*) 
                   FROM analytics_page_views v 
                   WHERE v.article_id = a.id 
                     AND v.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                     AND v.created_at > DATE_ADD(COALESCE(NULLIF(a.custom_published_at, '1970-01-01 00:00:01'), a.published_at, a.created_at), INTERVAL 7 DAY)
                 )
             END as display_views
      FROM articles a
      WHERE a.status = 'published'
      ORDER BY 
        display_views DESC,
        COALESCE(NULLIF(a.custom_published_at, '1970-01-01 00:00:01'), a.published_at, a.created_at) DESC
      LIMIT ?
    `;

    dbRows = await query(sql, [safeLimit]);
  } catch (err) {
    console.error("getMostReadArticles query error:", err);
  }

  return (dbRows || []).map((row) => {
    const isWithinWeek = row.is_within_validity_week === 1;
    const displayViews = Number(row.display_views) || 0;

    return toPublicArticleSummary({
      ...row,
      view_count: displayViews,
      week_views: displayViews,
      views: displayViews > 0 ? `${displayViews.toLocaleString("bn-BD")} পঠিত` : "সর্বশেষ সংবাদ",
      isWithinValidityWeek: isWithinWeek,
    });
  });
}

export async function getPublishedArticlesForSitemap(limit = 50000) {
  try {
    const safeLimit = Math.min(Math.max(1, Number(limit) || 50000), 50000);
    const sql = `
      SELECT id, slug, updated_at, created_at
      FROM articles
      WHERE status = 'published'
      ORDER BY updated_at DESC
      LIMIT ?
    `;
    const rows = await query(sql, [safeLimit]);
    return rows || [];
  } catch (error) {
    console.error("getPublishedArticlesForSitemap query error:", error);
    return [];
  }
}

