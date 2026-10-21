import { getDb } from "@/lib/db";

/**
 * Category Repository
 * Direct Cloudflare D1 / SQLite database read and write functions
 */

export async function getAllCategories() {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT * FROM categories ORDER BY sort_order ASC, name ASC")
    .all();
  return results;
}

export async function getAllCategoriesWithSubcategories() {
  const db = await getDb();
  const [categoriesRes, subcategoriesRes] = await Promise.all([
    db.prepare("SELECT * FROM categories ORDER BY sort_order ASC, name ASC").all(),
    db.prepare("SELECT * FROM subcategories ORDER BY sort_order ASC, name ASC").all(),
  ]);

  const categories = categoriesRes.results || [];
  const subcategories = subcategoriesRes.results || [];

  const subMap = new Map();
  for (const sub of subcategories) {
    if (!subMap.has(sub.category_id)) {
      subMap.set(sub.category_id, []);
    }
    subMap.get(sub.category_id).push(sub);
  }

  return categories.map((cat) => ({
    ...cat,
    subcategories: subMap.get(cat.id) || [],
  }));
}

export async function getCategoryBySlug(slug) {
  const db = await getDb();
  return await db
    .prepare("SELECT * FROM categories WHERE slug = ?")
    .bind(slug)
    .first();
}

export async function getSubcategoriesByCategoryId(categoryId) {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT * FROM subcategories WHERE category_id = ? ORDER BY sort_order ASC")
    .bind(categoryId)
    .all();
  return results;
}

