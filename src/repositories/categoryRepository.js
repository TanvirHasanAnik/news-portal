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

/**
 * Returns only dynamic content categories (excluding permanent 'latest' and 'handpicked')
 */
export async function getDynamicCategories() {
  const db = await getDb();
  const { results } = await db
    .prepare(
      "SELECT * FROM categories WHERE is_permanent = 0 AND slug NOT IN ('latest', 'handpicked') ORDER BY sort_order ASC, name ASC"
    )
    .all();
  return results || [];
}

/**
 * Returns only permanent system categories ('latest' and 'handpicked')
 */
export async function getPermanentCategories() {
  const db = await getDb();
  const { results } = await db
    .prepare(
      "SELECT * FROM categories WHERE is_permanent = 1 OR slug IN ('latest', 'handpicked') ORDER BY sort_order ASC, name ASC"
    )
    .all();
  return results || [];
}

/**
 * Returns dynamic content categories with their respective subcategories
 */
export async function getDynamicCategoriesWithSubcategories() {
  const allWithSubs = await getAllCategoriesWithSubcategories();
  return allWithSubs.filter((c) => !c.is_permanent && c.slug !== "latest" && c.slug !== "handpicked");
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

  // Ensure category is not permanent
  const category = await db
    .prepare("SELECT is_permanent, slug FROM categories WHERE id = ?")
    .bind(categoryId)
    .first();

  if (category?.is_permanent || category?.slug === "latest" || category?.slug === "handpicked") {
    throw new Error("স্থায়ী ক্যাটাগরির অধীনে সাব-ক্যাটাগরি যুক্ত করা সম্ভব নয়।");
  }

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

/**
 * Saves a batch of categories and their subcategories from the browser state.
 * Preserves permanent system categories, updates existing ones,
 * deletes removed dynamic categories, and inserts new ones.
 */
export async function saveCategoriesBatch(categoriesList = []) {
  const db = await getDb();

  // 1. Fetch current dynamic categories in database
  const { results: currentDbCats } = await db
    .prepare(
      "SELECT id, slug, is_permanent FROM categories WHERE is_permanent = 0 AND slug NOT IN ('latest', 'handpicked')"
    )
    .all();
  const currentDbCatIds = new Set((currentDbCats || []).map((c) => c.id));

  // Extract incoming dynamic categories
  const incomingDynamic = categoriesList.filter(
    (c) => !c.is_permanent && c.slug !== "latest" && c.slug !== "handpicked"
  );
  const incomingCatIds = new Set(
    incomingDynamic
      .map((c) => c.id)
      .filter((id) => id && !String(id).startsWith("temp_"))
  );

  // 2. Delete categories that were removed in browser
  for (const dbCat of currentDbCats || []) {
    if (!incomingCatIds.has(dbCat.id)) {
      // Clear foreign key references in articles before deleting
      await db
        .prepare("UPDATE articles SET category_id = NULL, subcategory_id = NULL WHERE category_id = ?")
        .bind(dbCat.id)
        .run();
      await db.prepare("DELETE FROM subcategories WHERE category_id = ?").bind(dbCat.id).run();
      await db.prepare("DELETE FROM categories WHERE id = ?").bind(dbCat.id).run();
    }
  }

  // 3. Insert or update incoming dynamic categories & their subcategories
  for (let i = 0; i < incomingDynamic.length; i++) {
    const cat = incomingDynamic[i];
    let catId = cat.id;
    const isNew = !catId || String(catId).startsWith("temp_") || !currentDbCatIds.has(catId);
    const sortOrder = Number(cat.sort_order ?? (i + 1) * 10);

    if (isNew) {
      catId = `cat_${cat.slug.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
      await db
        .prepare(
          `INSERT INTO categories (id, name, slug, is_permanent, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
        .bind(catId, cat.name, cat.slug, sortOrder)
        .run();
    } else {
      await db
        .prepare(
          `UPDATE categories
           SET name = ?, slug = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        )
        .bind(cat.name, cat.slug, sortOrder, catId)
        .run();

      // Keep denormalized article category names in sync
      await db
        .prepare("UPDATE articles SET category_name = ?, category_slug = ? WHERE category_id = ?")
        .bind(cat.name, cat.slug, catId)
        .run();
    }

    // Handle subcategories for this category
    const incomingSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
    const { results: currentDbSubs } = await db
      .prepare("SELECT id FROM subcategories WHERE category_id = ?")
      .bind(catId)
      .all();
    const currentSubIds = new Set((currentDbSubs || []).map((s) => s.id));
    const incomingSubIds = new Set(
      incomingSubs
        .map((s) => s.id)
        .filter((id) => id && !String(id).startsWith("temp_"))
    );

    // Delete removed subcategories
    for (const subId of currentSubIds) {
      if (!incomingSubIds.has(subId)) {
        await db.prepare("UPDATE articles SET subcategory_id = NULL WHERE subcategory_id = ?").bind(subId).run();
        await db.prepare("DELETE FROM subcategories WHERE id = ?").bind(subId).run();
      }
    }

    // Insert or update subcategories
    for (let j = 0; j < incomingSubs.length; j++) {
      const sub = incomingSubs[j];
      let subId = sub.id;
      const isSubNew = !subId || String(subId).startsWith("temp_") || !currentSubIds.has(subId);
      const subSortOrder = Number(sub.sort_order ?? (j + 1) * 10);

      if (isSubNew) {
        subId = `sub_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        await db
          .prepare(
            `INSERT INTO subcategories (id, category_id, name, slug, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
          )
          .bind(subId, catId, sub.name, sub.slug, subSortOrder)
          .run();
      } else {
        await db
          .prepare(
            `UPDATE subcategories
             SET name = ?, slug = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`
          )
          .bind(sub.name, sub.slug, subSortOrder, subId)
          .run();

        // Keep denormalized article subcategory names in sync
        await db
          .prepare("UPDATE articles SET subcategory_name = ? WHERE subcategory_id = ?")
          .bind(sub.name, subId)
          .run();
      }
    }
  }

  const affectedSlugs = Array.from(
    new Set([
      ...(currentDbCats || []).map((c) => c.slug),
      ...incomingDynamic.map((c) => c.slug),
    ])
  );

  return { success: true, affectedSlugs };
}


