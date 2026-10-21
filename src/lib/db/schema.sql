-- ============================================================
-- News Portal SQLite / Cloudflare D1 Database Schema
-- Covers all features specified in admin_panel_features.md
-- ============================================================

-- 1. Users table (Super Admin, Admin, Editor-in-Chief, Editor, Sub-editor, Reporter)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('super_admin', 'admin', 'editor_in_chief', 'editor', 'sub_editor', 'reporter')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disabled', 'invited')),
  avatar TEXT,
  bio TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin Requests table (Requests from Admin to Super Admin)
CREATE TABLE IF NOT EXISTS admin_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES users(id),
  request_type TEXT NOT NULL CHECK(request_type IN ('new_user', 'disable_user', 'role_change', 'curation_change', 'other')),
  target_user_id TEXT REFERENCES users(id),
  payload TEXT, -- JSON details (e.g. requested role, user email)
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT REFERENCES users(id),
  reviewer_note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories table (Permanent & Dynamic Categories)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_permanent INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, slug)
);

-- 5. Articles table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  headline TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT,
  category_id TEXT REFERENCES categories(id),
  category_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  subcategory_id TEXT REFERENCES subcategories(id),
  subcategory_name TEXT,
  images TEXT, -- JSON array of image URLs (maximum 3 images)
  image TEXT, -- Primary featured image (first image from images array)
  youtube_url TEXT,
  author_id TEXT REFERENCES users(id),
  author_name TEXT,
  location TEXT DEFAULT 'ঢাকা',
  read_time TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'pending_approval', 'published', 'archived', 'rejected')),
  is_breaking INTEGER DEFAULT 0,
  is_lead INTEGER DEFAULT 0,
  is_handpicked INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 6. Content History / Revision Control table
CREATE TABLE IF NOT EXISTS article_revisions (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  editor_id TEXT REFERENCES users(id),
  headline TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  change_summary TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 7. Curated Collections (Handpicked News & Breaking News lists)
CREATE TABLE IF NOT EXISTS curated_news (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('handpicked', 'breaking', 'lead')),
  article_id TEXT REFERENCES articles(id) ON DELETE SET NULL,
  custom_title TEXT,
  custom_url TEXT,
  priority INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 8. Analytics & Manual View Counting table
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  article_id TEXT REFERENCES articles(id) ON DELETE SET NULL,
  category_slug TEXT,
  subcategory_name TEXT,
  referrer TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  viewed_date TEXT NOT NULL, -- YYYY-MM-DD
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Logs of Administrative Actions table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details TEXT, -- JSON payload
  ip_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_slug);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_breaking ON articles(is_breaking);
CREATE INDEX IF NOT EXISTS idx_articles_handpicked ON articles(is_handpicked);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_page_views(viewed_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

