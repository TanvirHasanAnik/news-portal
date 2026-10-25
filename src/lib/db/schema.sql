-- ============================================================
-- News Portal MySQL / TiDB Database Schema
-- Strict Unicode (utf8mb4) & InnoDB engine for workerd / TiDB compatibility
-- ============================================================

-- 1. Users table (Super Admin, Admin, Editor-in-Chief, Editor, Sub-editor, Reporter)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password VARCHAR(255) NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'reporter',
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  must_change_password TINYINT(1) NOT NULL DEFAULT 0,
  avatar TEXT NULL,
  bio TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_status (status),
  INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Admin Requests table (Requests from Admin to Super Admin)
CREATE TABLE IF NOT EXISTS admin_requests (
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
  INDEX idx_admin_requests_created (created_at),
  CONSTRAINT fk_admin_requests_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_admin_requests_target FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_admin_requests_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Categories table (Permanent & Dynamic Categories)
CREATE TABLE IF NOT EXISTS categories (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  category_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subcategories_cat_slug (category_id, slug),
  INDEX idx_subcategories_category_id (category_id),
  INDEX idx_subcategories_sort_order (sort_order),
  CONSTRAINT fk_subcategories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Articles table
CREATE TABLE IF NOT EXISTS articles (
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
  INDEX idx_articles_view_count (view_count),
  CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Content History / Revision Control table
CREATE TABLE IF NOT EXISTS article_revisions (
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
  INDEX idx_revisions_created_at (created_at),
  CONSTRAINT fk_revisions_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_revisions_editor FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Curated Collections (Handpicked News & Breaking News lists)
CREATE TABLE IF NOT EXISTS curated_news (
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
  INDEX idx_curated_article_id (article_id),
  CONSTRAINT fk_curated_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Analytics & Manual View Counting table
CREATE TABLE IF NOT EXISTS analytics_page_views (
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
  INDEX idx_analytics_category (category_slug),
  CONSTRAINT fk_analytics_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Audit Logs of Administrative Actions table
CREATE TABLE IF NOT EXISTS audit_logs (
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
  INDEX idx_audit_logs_created_at (created_at),
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Comments table
CREATE TABLE IF NOT EXISTS comments (
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
  INDEX idx_comments_parent_id (parent_id),
  CONSTRAINT fk_comments_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
