import bcrypt from "bcryptjs";

let isSeeded = false;
let seedingPromise = null;

const BCRYPT_SALT_ROUNDS = 12;

const TABLE_DEFINITIONS = [

  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    full_name VARCHAR(255) NULL,
    name VARCHAR(255) NULL,
    email VARCHAR(191) NULL,
    phone VARCHAR(32) NULL,
    password VARCHAR(255) NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'reporter',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    must_change_password TINYINT(1) NOT NULL DEFAULT 0,
    avatar TEXT NULL,
    bio TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status),
    INDEX idx_users_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS admin_requests (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    requester_id VARCHAR(64) NOT NULL,
    request_type VARCHAR(64) NOT NULL,
    target_user_id VARCHAR(64) NULL,
    payload TEXT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    reviewed_by VARCHAR(64) NULL,
    reviewer_note TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_admin_requests_status (status),
    INDEX idx_admin_requests_requester (requester_id),
    INDEX idx_admin_requests_target (target_user_id),
    INDEX idx_admin_requests_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(191) NOT NULL,
    is_permanent TINYINT(1) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_categories_slug (slug),
    INDEX idx_categories_sort_order (sort_order),
    INDEX idx_categories_is_permanent (is_permanent)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS subcategories (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    category_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(191) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_subcategories_cat_slug (category_id, slug),
    INDEX idx_subcategories_category_id (category_id),
    INDEX idx_subcategories_sort_order (sort_order)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    headline VARCHAR(500) NOT NULL,
    slug VARCHAR(191) NOT NULL,
    summary TEXT NULL,
    content LONGTEXT NULL,
    category_id VARCHAR(64) NULL,
    category_name VARCHAR(255) NOT NULL,
    category_slug VARCHAR(191) NOT NULL,
    subcategory_id VARCHAR(64) NULL,
    subcategory_name VARCHAR(255) NULL,
    images JSON NULL,
    image VARCHAR(1000) NULL,
    youtube_url VARCHAR(1000) NULL,
    author_id VARCHAR(64) NULL,
    author_name VARCHAR(255) NULL,
    location VARCHAR(255) DEFAULT 'ঢাকা',
    read_time VARCHAR(100) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    is_breaking TINYINT(1) NOT NULL DEFAULT 0,
    is_lead TINYINT(1) NOT NULL DEFAULT 0,
    is_handpicked TINYINT(1) NOT NULL DEFAULT 0,
    rejection_reason TEXT NULL,
    created_by VARCHAR(64) NULL,
    last_edited_by VARCHAR(64) NULL,
    last_edited_at TIMESTAMP NULL DEFAULT NULL,
    is_passed_to_upper TINYINT(1) NOT NULL DEFAULT 0,
    passed_by VARCHAR(64) NULL,
    passed_at TIMESTAMP NULL DEFAULT NULL,
    view_count INT NOT NULL DEFAULT 0,
    published_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_articles_slug (slug),
    INDEX idx_articles_status (status),
    INDEX idx_articles_category_slug (category_slug),
    INDEX idx_articles_published_at (published_at),
    INDEX idx_articles_created_at (created_at),
    INDEX idx_articles_status_created (status, created_at),
    INDEX idx_articles_status_cat_created (status, category_slug, created_at),
    INDEX idx_articles_breaking (is_breaking, status, created_at),
    INDEX idx_articles_lead (is_lead, status, created_at),
    INDEX idx_articles_handpicked (is_handpicked, status, created_at),
    INDEX idx_articles_author (author_id),
    INDEX idx_articles_created_by (created_by),
    INDEX idx_articles_last_edited_by (last_edited_by),
    INDEX idx_articles_view_count (view_count)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS article_revisions (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    article_id VARCHAR(64) NOT NULL,
    editor_id VARCHAR(64) NULL,
    headline VARCHAR(500) NOT NULL,
    summary TEXT NULL,
    content LONGTEXT NULL,
    change_summary VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_revisions_article (article_id),
    INDEX idx_revisions_editor (editor_id),
    INDEX idx_revisions_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS curated_news (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    article_id VARCHAR(64) NULL,
    custom_title VARCHAR(500) NULL,
    custom_url VARCHAR(1000) NULL,
    priority INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_curated_type_active_priority (type, is_active, priority),
    INDEX idx_curated_article_id (article_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS analytics_page_views (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    path VARCHAR(500) NOT NULL,
    article_id VARCHAR(64) NULL,
    category_slug VARCHAR(191) NULL,
    subcategory_name VARCHAR(255) NULL,
    referrer VARCHAR(1000) NULL,
    ip_hash VARCHAR(128) NULL,
    user_agent VARCHAR(500) NULL,
    viewed_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_analytics_date (viewed_date),
    INDEX idx_analytics_article_created (article_id, created_at),
    INDEX idx_analytics_category (category_slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(64) NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(191) NULL,
    content TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    parent_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_comments_article_status (article_id, status),
    INDEX idx_comments_created_at (created_at),
    INDEX idx_comments_parent_id (parent_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_type VARCHAR(64) NULL,
    target_id VARCHAR(64) NULL,
    target_slug VARCHAR(191) NULL,
    action_by VARCHAR(64) NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user_created (user_id, created_at),
    INDEX idx_notifications_user_read (user_id, is_read),
    INDEX idx_notifications_type (type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

const DEFAULT_CATEGORIES = [
  ['cat_latest', 'সর্বশেষ', 'latest', 1, 1],
  ['cat_handpicked', 'বাছাইকৃত', 'handpicked', 1, 2],
  ['cat_national', 'জাতীয়', 'national', 0, 3],
  ['cat_politics', 'রাজনীতি', 'politics', 0, 4],
  ['cat_economy', 'অর্থনীতি', 'economy', 0, 5],
  ['cat_international', 'আন্তর্জাতিক', 'international', 0, 6],
  ['cat_sports', 'খেলাধুলা', 'sports', 0, 7],
  ['cat_entertainment', 'বিনোদন', 'entertainment', 0, 8],
  ['cat_technology', 'প্রযুক্তি', 'technology', 0, 9],
  ['cat_lifestyle', 'জীবনযাপন', 'lifestyle', 0, 10],
  ['cat_career', 'চাকরি ও ক্যারিয়ার', 'career', 0, 11],
  ['cat_opinion', 'মতামত', 'opinion', 0, 12],
];

const DEFAULT_SUBCATEGORIES = [
  ['cat_national_s_1', 'cat_national', 'রাজধানী', 'sub_national_1', 1],
  ['cat_national_s_2', 'cat_national', 'সারাদেশ', 'sub_national_2', 2],
  ['cat_national_s_3', 'cat_national', 'আইন ও আদালত', 'sub_national_3', 3],
  ['cat_national_s_4', 'cat_national', 'শিক্ষা', 'sub_national_4', 4],
  ['cat_national_s_5', 'cat_national', 'স্বাস্থ্য', 'sub_national_5', 5],
  ['cat_national_s_6', 'cat_national', 'প্রশাসন', 'sub_national_6', 6],

  ['cat_politics_s_1', 'cat_politics', 'সরকার', 'sub_politics_1', 1],
  ['cat_politics_s_2', 'cat_politics', 'দলীয় সংবাদ', 'sub_politics_2', 2],
  ['cat_politics_s_3', 'cat_politics', 'সংসদ', 'sub_politics_3', 3],
  ['cat_politics_s_4', 'cat_politics', 'নির্বাচন', 'sub_politics_4', 4],
  ['cat_politics_s_5', 'cat_politics', 'কূটনীতি', 'sub_politics_5', 5],

  ['cat_economy_s_1', 'cat_economy', 'ব্যাংকিং ও বিমা', 'sub_economy_1', 1],
  ['cat_economy_s_2', 'cat_economy', 'শেয়ারবাজার', 'sub_economy_2', 2],
  ['cat_economy_s_3', 'cat_economy', 'ব্যবসা-বাণিজ্য', 'sub_economy_3', 3],
  ['cat_economy_s_4', 'cat_economy', 'রাজস্ব', 'sub_economy_4', 4],
  ['cat_economy_s_5', 'cat_economy', 'বাজেট', 'sub_economy_5', 5],

  ['cat_international_s_1', 'cat_international', 'এশিয়া', 'sub_international_1', 1],
  ['cat_international_s_2', 'cat_international', 'মধ্যপ্রাচ্য', 'sub_international_2', 2],
  ['cat_international_s_3', 'cat_international', 'ইউরোপ-আমেরিকা', 'sub_international_3', 3],
  ['cat_international_s_4', 'cat_international', 'ভারত', 'sub_international_4', 4],
  ['cat_international_s_5', 'cat_international', 'যুদ্ধ ও সংঘাত', 'sub_international_5', 5],

  ['cat_sports_s_1', 'cat_sports', 'ক্রিকেট', 'sub_sports_1', 1],
  ['cat_sports_s_2', 'cat_sports', 'ফুটবল', 'sub_sports_2', 2],
  ['cat_sports_s_3', 'cat_sports', 'আন্তর্জাতিক ক্রীড়া', 'sub_sports_3', 3],
  ['cat_sports_s_4', 'cat_sports', 'টেনিস', 'sub_sports_4', 4],
  ['cat_sports_s_5', 'cat_sports', 'স্থানীয় টুর্নামেন্ট', 'sub_sports_5', 5],

  ['cat_entertainment_s_1', 'cat_entertainment', 'চলচ্চিত্র', 'sub_entertainment_1', 1],
  ['cat_entertainment_s_2', 'cat_entertainment', 'নাটক ও ওটিটি', 'sub_entertainment_2', 2],
  ['cat_entertainment_s_3', 'cat_entertainment', 'সঙ্গীত', 'sub_entertainment_3', 3],
  ['cat_entertainment_s_4', 'cat_entertainment', 'টেলিভিশন', 'sub_entertainment_4', 4],
  ['cat_entertainment_s_5', 'cat_entertainment', 'হলিউড-বলিউড', 'sub_entertainment_5', 5],

  ['cat_technology_s_1', 'cat_technology', 'স্মার্টফোন ও গ্যাজেট', 'sub_technology_1', 1],
  ['cat_technology_s_2', 'cat_technology', 'কৃত্রিম বুদ্ধিমত্তা', 'sub_technology_2', 2],
  ['cat_technology_s_3', 'cat_technology', 'ইন্টারনেট', 'sub_technology_3', 3],
  ['cat_technology_s_4', 'cat_technology', 'তথ্যপ্রযুক্তি খাত', 'sub_technology_4', 4],
  ['cat_technology_s_5', 'cat_technology', 'উদ্ভাবন', 'sub_technology_5', 5],

  ['cat_lifestyle_s_1', 'cat_lifestyle', 'স্বাস্থ্য ও রূপচর্চা', 'sub_lifestyle_1', 1],
  ['cat_lifestyle_s_2', 'cat_lifestyle', 'ভ্রমণ', 'sub_lifestyle_2', 2],
  ['cat_lifestyle_s_3', 'cat_lifestyle', 'রেসিপি ও খাবার', 'sub_lifestyle_3', 3],
  ['cat_lifestyle_s_4', 'cat_lifestyle', 'ফ্যাশন', 'sub_lifestyle_4', 4],
  ['cat_lifestyle_s_5', 'cat_lifestyle', 'পরামর্শ', 'sub_lifestyle_5', 5],

  ['cat_career_s_1', 'cat_career', 'সরকারি চাকরি', 'sub_career_1', 1],
  ['cat_career_s_2', 'cat_career', 'বেসরকারি নিয়োগ', 'sub_career_2', 2],
  ['cat_career_s_3', 'cat_career', 'ক্যারিয়ার গাইড', 'sub_career_3', 3],
  ['cat_career_s_4', 'cat_career', 'বিসিএস প্রস্তুতি', 'sub_career_4', 4],
  ['cat_career_s_5', 'cat_career', 'উচ্চশিক্ষা', 'sub_career_5', 5],

  ['cat_opinion_s_1', 'cat_opinion', 'সম্পাদকীয়', 'sub_opinion_1', 1],
  ['cat_opinion_s_2', 'cat_opinion', 'কলাম', 'sub_opinion_2', 2],
  ['cat_opinion_s_3', 'cat_opinion', 'মুক্তমত', 'sub_opinion_3', 3],
  ['cat_opinion_s_4', 'cat_opinion', 'বিশ্লেষণ', 'sub_opinion_4', 4],
];

async function executeUniversalQuery(sql, params = [], env = {}) {
  const isWorker =
    typeof WebSocketPair !== "undefined" ||
    (typeof navigator !== "undefined" && navigator.userAgent?.includes("Cloudflare"));

  if (isWorker) {
    const { executeQuery } = await import("./tidbClient.js");
    return await executeQuery(sql, params, env);
  }

  const { getConnectionHandle } = await import("./index.js");
  const handle = await getConnectionHandle();
  try {
    const [rows] = await handle.query(sql, params);
    return rows;
  } finally {
    if (typeof handle.release === "function") {
      await handle.release();
    }
  }
}

export function resolveEnvSecrets(env = {}) {
  const getVal = (key) =>
    env[key] !== undefined
      ? env[key]
      : typeof process !== "undefined" && process.env
      ? process.env[key]
      : undefined;

  const superAdminPassword = (
    getVal("SUPER_ADMIN_PASSWORD") ||
    getVal("SUPER_ADMIN_FALLBACK_PASSWORD") ||
    getVal("INITIAL_SUPER_ADMIN_PASSWORD") ||
    "SuperAdminSecure2026!"
  ).trim();

  const adminPassword = (
    getVal("ADMIN_PASSWORD") ||
    getVal("ADMIN_FALLBACK_PASSWORD") ||
    getVal("INITIAL_ADMIN_PASSWORD") ||
    "AdminSecure2026!"
  ).trim();

  const superAdminUsername = (
    getVal("SUPER_ADMIN_USERNAME") ||
    getVal("INITIAL_SUPER_ADMIN_USERNAME") ||
    "superadmin"
  ).trim().toLowerCase();

  const adminUsername = (
    getVal("ADMIN_USERNAME") ||
    getVal("INITIAL_ADMIN_USERNAME") ||
    "admin"
  ).trim().toLowerCase();

  return {
    superAdminUsername,
    superAdminEmail: (getVal("SUPER_ADMIN_EMAIL") || getVal("INITIAL_SUPER_ADMIN_EMAIL") || "").trim().toLowerCase() || null,
    superAdminName: (getVal("SUPER_ADMIN_NAME") || getVal("INITIAL_SUPER_ADMIN_NAME") || "").trim() || null,
    superAdminPassword,
    superAdminFallbackPassword: superAdminPassword,

    adminUsername,
    adminEmail: (getVal("ADMIN_EMAIL") || getVal("INITIAL_ADMIN_EMAIL") || "").trim().toLowerCase() || null,
    adminName: (getVal("ADMIN_NAME") || getVal("INITIAL_ADMIN_NAME") || "").trim() || null,
    adminPassword,
    adminFallbackPassword: adminPassword,
  };
}

export function getFallbackPasswordForRole(role, env = {}) {
  const secrets = resolveEnvSecrets(env);
  if (role === "super_admin") {
    return secrets.superAdminFallbackPassword;
  }
  if (role === "admin") {
    return secrets.adminFallbackPassword;
  }
  return null;
}

export async function bootstrapDatabase(env = {}) {
  if (isSeeded) {
    return { seeded: false, skipped: true, reason: "already_seeded" };
  }

  if (seedingPromise) {
    return await seedingPromise;
  }

  seedingPromise = (async () => {
    try {

      for (const tableSql of TABLE_DEFINITIONS) {
        await executeUniversalQuery(tableSql, [], env);
      }

      try {
        await executeUniversalQuery("ALTER TABLE articles ADD COLUMN created_by VARCHAR(64) NULL", [], env);
      } catch (_e) {}
      try {
        await executeUniversalQuery("ALTER TABLE articles ADD COLUMN last_edited_by VARCHAR(64) NULL", [], env);
      } catch (_e) {}
      try {
        await executeUniversalQuery("ALTER TABLE articles ADD COLUMN last_edited_at TIMESTAMP NULL DEFAULT NULL", [], env);
      } catch (_e) {}
      try {
        await executeUniversalQuery("ALTER TABLE articles ADD COLUMN is_passed_to_upper TINYINT(1) NOT NULL DEFAULT 0", [], env);
      } catch (_e) {}
      try {
        await executeUniversalQuery("ALTER TABLE articles ADD COLUMN passed_by VARCHAR(64) NULL", [], env);
      } catch (_e) {}
      try {
        await executeUniversalQuery("ALTER TABLE articles ADD COLUMN passed_at TIMESTAMP NULL DEFAULT NULL", [], env);
      } catch (_e) {}
      try {
        await executeUniversalQuery("ALTER TABLE articles ADD COLUMN rejection_reason TEXT NULL", [], env);
      } catch (_e) {}

      try {
        await executeUniversalQuery(
          `UPDATE articles a
           LEFT JOIN users u ON a.author_id = u.id
           SET a.created_by = COALESCE(u.username, 'reporter')
           WHERE a.created_by IS NULL OR a.created_by = '' OR a.created_by = 'নিজস্ব প্রতিবেদক'`,
          [],
          env
        );

        await executeUniversalQuery(
          `UPDATE articles
           SET last_edited_by = NULL
           WHERE last_edited_by = created_by 
              OR last_edited_by = 'নিজস্ব প্রতিবেদক' 
              OR last_edited_by = 'সম্পাদক'
              OR last_edited_by = ''`,
          [],
          env
        );
      } catch (_e) {}

      try {
        const notifCountRows = await executeUniversalQuery("SELECT COUNT(*) as cnt FROM notifications", [], env);
        const notifCount = Number(Array.isArray(notifCountRows) ? notifCountRows[0]?.cnt : 0);
        if (notifCount === 0) {

          const artRows = await executeUniversalQuery(
            `SELECT a.id, a.headline, a.slug, a.status, a.author_id, a.is_passed_to_upper, a.passed_by, a.created_at, u.username as author_username
             FROM articles a
             LEFT JOIN users u ON a.author_id = u.id
             WHERE a.status IN ('published', 'rejected') AND a.author_id IS NOT NULL
             ORDER BY a.created_at DESC LIMIT 20`,
            [],
            env
          );
          if (Array.isArray(artRows)) {
            for (const art of artRows) {
              const isApproved = art.status === "published";
              await executeUniversalQuery(
                `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
                 VALUES (?, ?, ?, ?, ?, 'article', ?, ?, 'admin', 0, ?)`,
                [
                  `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  art.author_id,
                  isApproved ? "article_approved" : "article_rejected",
                  isApproved ? "সংবাদ অনুমোদিত ও প্রকাশিত হয়েছে" : "সংবাদ প্রত্যাখ্যাত হয়েছে",
                  isApproved
                    ? `আপনার সংবাদ "${art.headline}" অনুমোদন ও প্রকাশ করা হয়েছে।`
                    : `আপনার সংবাদ "${art.headline}" পর্যালোচনায় প্রত্যাখ্যাত হয়েছে।`,
                  art.id,
                  art.slug,
                  art.created_at || new Date(),
                ],
                env
              );

              if (isApproved && art.is_passed_to_upper && art.passed_by) {
                const subUserRows = await executeUniversalQuery(
                  "SELECT id FROM users WHERE username = ?",
                  [art.passed_by],
                  env
                );
                if (Array.isArray(subUserRows) && subUserRows[0]?.id && subUserRows[0].id !== art.author_id) {
                  await executeUniversalQuery(
                    `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
                     VALUES (?, ?, 'article_approved', 'যাচাইকৃত সংবাদ অনুমোদিত ও প্রকাশিত হয়েছে', ?, 'article', ?, ?, 'admin', 0, ?)`,
                    [
                      `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                      subUserRows[0].id,
                      `আপনার যাচাই ও অগ্রসরকৃত সংবাদ "${art.headline}" কর্তৃপক্ষ কর্তৃক অনুমোদিত ও প্রকাশিত হয়েছে।`,
                      art.id,
                      art.slug,
                      art.created_at || new Date(),
                    ],
                    env
                  );
                }
              }
            }
          }

          const reqRows = await executeUniversalQuery(
            `SELECT id, requester_id, request_type, status, reviewer_note, created_at
             FROM admin_requests
             WHERE status IN ('approved', 'rejected')
             ORDER BY created_at DESC LIMIT 10`,
            [],
            env
          );
          if (Array.isArray(reqRows)) {
            for (const r of reqRows) {
              const isApproved = r.status === "approved";
              const typeLabels = {
                new_user: "নতুন ব্যবহারকারী তৈরির আবেদন",
                disable_user: "ব্যবহারকারী নিষ্ক্রিয়করণের আবেদন",
                role_change: "রোল পরিবর্তনের আবেদন",
              };
              const reqLabel = typeLabels[r.request_type] || "প্রশাসনিক আবেদন";
              await executeUniversalQuery(
                `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
                 VALUES (?, ?, ?, ?, ?, 'request', ?, NULL, 'superadmin', 0, ?)`,
                [
                  `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  r.requester_id,
                  isApproved ? "request_approved" : "request_rejected",
                  isApproved ? "প্রশাসনিক আবেদন অনুমোদিত হয়েছে" : "প্রশাসনিক আবেদন প্রত্যাখ্যাত হয়েছে",
                  isApproved
                    ? `আপনার "${reqLabel}" সুপার অ্যাডমিন কর্তৃক অনুমোদিত হয়েছে।`
                    : `আপনার "${reqLabel}" প্রত্যাখ্যাত হয়েছে। ${r.reviewer_note ? `নোট: ${r.reviewer_note}` : ""}`,
                  r.id,
                  r.created_at || new Date(),
                ],
                env
              );
            }
          }

          const subEditorRows = await executeUniversalQuery(
            "SELECT id FROM users WHERE role = 'sub_editor' AND status = 'active'",
            [],
            env
          );
          if (Array.isArray(subEditorRows) && subEditorRows.length > 0) {
            const pendingReporterArticles = await executeUniversalQuery(
              `SELECT a.id, a.headline, a.slug, COALESCE(u.username, a.created_by, 'reporter') as reporter_username, a.created_at
               FROM articles a
               LEFT JOIN users u ON a.author_id = u.id
               WHERE (a.status = 'pending' OR a.status = 'pending_approval')
               ORDER BY a.created_at DESC LIMIT 5`,
              [],
              env
            );
            if (Array.isArray(pendingReporterArticles)) {
              for (const pArt of pendingReporterArticles) {
                for (const sub of subEditorRows) {
                  await executeUniversalQuery(
                    `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at)
                     VALUES (?, ?, 'article_submitted', 'প্রতিবেদকের নতুন সংবাদ জমা', ?, 'article', ?, ?, ?, 0, ?)`,
                    [
                      `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                      sub.id,
                      `প্রতিবেদক @${pArt.reporter_username} পর্যালোচনার জন্য নতুন সংবাদ "${pArt.headline}" জমা দিয়েছেন।`,
                      pArt.id,
                      pArt.slug,
                      pArt.reporter_username,
                      pArt.created_at || new Date(),
                    ],
                    env
                  );
                }
              }
            }
          }
        }
      } catch (_notifSeedErr) {}

      try {
        const catRows = await executeUniversalQuery(
          "SELECT COUNT(*) as count FROM categories",
          [],
          env
        );
        const catCount = Number(Array.isArray(catRows) ? catRows[0]?.count : 0);
        if (catCount === 0) {
          for (const cat of DEFAULT_CATEGORIES) {
            await executeUniversalQuery(
              "INSERT IGNORE INTO categories (id, name, slug, is_permanent, sort_order) VALUES (?, ?, ?, ?, ?)",
              cat,
              env
            );
          }
        }
      } catch (err) {
        console.warn("[Auto-Bootstrap categories]:", err?.message);
      }

      try {
        const subRows = await executeUniversalQuery(
          "SELECT COUNT(*) as count FROM subcategories",
          [],
          env
        );
        const subCount = Number(Array.isArray(subRows) ? subRows[0]?.count : 0);
        if (subCount === 0) {
          for (const sub of DEFAULT_SUBCATEGORIES) {
            await executeUniversalQuery(
              "INSERT IGNORE INTO subcategories (id, category_id, name, slug, sort_order) VALUES (?, ?, ?, ?, ?)",
              sub,
              env
            );
          }
        }
      } catch (err) {
        console.warn("[Auto-Bootstrap subcategories]:", err?.message);
      }

      try {
        await executeUniversalQuery(
          "DELETE FROM users WHERE id = 'usr_reporter' OR username = 'reporter'",
          [],
          env
        );
      } catch (_e) {}

      try {
        await executeUniversalQuery(
          `UPDATE users 
           SET full_name = NULL, name = NULL, email = NULL 
           WHERE role = 'super_admin' AND (full_name IN ('Super Admin', 'সুপার অ্যাডমিন') OR email IN ('superadmin@aloshbe.com', 'admin@aloshbe.com'))`,
          [],
          env
        );
        await executeUniversalQuery(
          `UPDATE users 
           SET full_name = NULL, name = NULL, email = NULL 
           WHERE role = 'admin' AND (full_name IN ('Admin', 'অ্যাডমিন') OR email IN ('admin@aloshbe.com', 'superadmin@aloshbe.com'))`,
          [],
          env
        );
      } catch (_e) {}

      const secrets = resolveEnvSecrets(env);
      const existingUsers = await executeUniversalQuery(
        "SELECT id, username, role, email FROM users WHERE role IN (?, ?)",
        ["super_admin", "admin"],
        env
      );

      const rows = Array.isArray(existingUsers) ? existingUsers : [];
      const hasSuperAdmin = rows.some((u) => u.role === "super_admin");
      const hasAdmin = rows.some((u) => u.role === "admin");

      if (!hasSuperAdmin && secrets.superAdminPassword) {
        const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(secrets.superAdminPassword, salt);
        const userId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `usr_sa_${Date.now()}`;

        await executeUniversalQuery(
          `INSERT INTO users (id, username, full_name, name, email, phone, password, role, status, must_change_password, bio, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, '', ?, 'super_admin', 'active', 1, 'সিস্টেম সুপার অ্যাডমিন', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [userId, secrets.superAdminUsername, secrets.superAdminName, secrets.superAdminName, secrets.superAdminEmail, hashedPassword],
          env
        );
      }

      if (!hasAdmin && secrets.adminPassword) {
        const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(secrets.adminPassword, salt);
        const userId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `usr_adm_${Date.now()}`;

        await executeUniversalQuery(
          `INSERT INTO users (id, username, full_name, name, email, phone, password, role, status, must_change_password, bio, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, '', ?, 'admin', 'active', 1, 'সিস্টেম অ্যাডমিন', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [userId, secrets.adminUsername, secrets.adminName, secrets.adminName, secrets.adminEmail, hashedPassword],
          env
        );
      }

      isSeeded = true;
      return { success: true };
    } catch (err) {
      console.error("[Auto-Bootstrap Critical Error]:", err);
      throw err;
    } finally {
      seedingPromise = null;
    }
  })();

  return await seedingPromise;
}
