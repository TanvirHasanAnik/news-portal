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

/**
 * Creates a new category
 */
export async function createCategory({ name, slug, sortOrder = 0, isPermanent = 0 }) {
  const db = await getDb();
  const id = `cat_${slug.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString(36)}`;

  await db
    .prepare(
      `INSERT INTO categories (id, name, slug, is_permanent, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .bind(id, name, slug, isPermanent ? 1 : 0, Number(sortOrder) || 0)
    .run();

  return { id, name, slug };
}

/**
 * Updates an existing category
 */
export async function updateCategory(id, { name, slug, sortOrder }) {
  const db = await getDb();
  await db
    .prepare(
      `UPDATE categories
       SET name = ?, slug = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(name, slug, Number(sortOrder) || 0, id)
    .run();

  return { id, name, slug };
}

/**
 * Deletes a category (if not marked permanent)
 */
export async function deleteCategory(id) {
  const db = await getDb();
  // Ensure not permanent
  const category = await db.prepare("SELECT is_permanent FROM categories WHERE id = ?").bind(id).first();
  if (category?.is_permanent) {
    throw new Error("স্থায়ী ক্যাটাগরি মুছে ফেলা সম্ভব নয়।");
  }

  // Subcategories are cascaded or delete them explicitly
  await db.prepare("DELETE FROM subcategories WHERE category_id = ?").bind(id).run();
  return await db.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
}

/**
 * Creates a new subcategory under an existing category
 */
export async function createSubcategory({ categoryId, name, slug, sortOrder = 0 }) {
  const db = await getDb();
  const id = `sub_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  await db
    .prepare(
      `INSERT INTO subcategories (id, category_id, name, slug, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .bind(id, categoryId, name, slug, Number(sortOrder) || 0)
    .run();

  return { id, categoryId, name, slug };
}

/**
 * Deletes a subcategory
 */
export async function deleteSubcategory(id) {
  const db = await getDb();
  return await db.prepare("DELETE FROM subcategories WHERE id = ?").bind(id).run();
}


