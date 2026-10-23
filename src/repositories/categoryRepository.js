import { getDb, query, queryOne, withTransaction } from "@/lib/db";

/**
 * Category Repository
 * Raw MySQL (mysql2/promise) data layer designed for Cloudflare Workers (workerd) & TiDB.
 */

export async function getAllCategories() {
  const rows = await query("SELECT * FROM categories ORDER BY sort_order ASC, name ASC");
  return rows || [];
}

/**
 * Returns only dynamic content categories (excluding permanent 'latest' and 'handpicked')
 */
export async function getDynamicCategories() {
  const rows = await query(
    "SELECT * FROM categories WHERE is_permanent = 0 AND slug NOT IN ('latest', 'handpicked') ORDER BY sort_order ASC, name ASC"
  );
  return rows || [];
}

/**
 * Returns only permanent system categories ('latest' and 'handpicked')
 */
export async function getPermanentCategories() {
  const rows = await query(
    "SELECT * FROM categories WHERE is_permanent = 1 OR slug IN ('latest', 'handpicked') ORDER BY sort_order ASC, name ASC"
  );
  return rows || [];
}

/**
 * Returns dynamic content categories with their respective subcategories
 */
export async function getDynamicCategoriesWithSubcategories() {
  const allWithSubs = await getAllCategoriesWithSubcategories();
  return allWithSubs.filter((c) => !c.is_permanent && c.slug !== "latest" && c.slug !== "handpicked");
}

export async function getAllCategoriesWithSubcategories() {
  const [categories, subcategories] = await Promise.all([
    query("SELECT * FROM categories ORDER BY sort_order ASC, name ASC"),
    query("SELECT * FROM subcategories ORDER BY sort_order ASC, name ASC"),
  ]);

  const subMap = new Map();
  for (const sub of subcategories || []) {
    if (!subMap.has(sub.category_id)) {
      subMap.set(sub.category_id, []);
    }
    subMap.get(sub.category_id).push(sub);
  }

  return (categories || []).map((cat) => ({
    ...cat,
    subcategories: subMap.get(cat.id) || [],
  }));
}

export async function getCategoryBySlug(slug) {
  return await queryOne("SELECT * FROM categories WHERE slug = ?", [slug]);
}

export async function getSubcategoriesByCategoryId(categoryId) {
  const rows = await query(
    "SELECT * FROM subcategories WHERE category_id = ? ORDER BY sort_order ASC",
    [categoryId]
  );
  return rows || [];
}

/**
 * Creates a new category
 */
export async function createCategory({ name, slug, sortOrder = 0, isPermanent = 0 }) {
  const id = `cat_${slug.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString(36)}`;

  await query(
    `INSERT INTO categories (id, name, slug, is_permanent, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, name, slug, isPermanent ? 1 : 0, Number(sortOrder) || 0]
  );

  return { id, name, slug };
}

/**
 * Updates an existing category
 */
export async function updateCategory(id, { name, slug, sortOrder }) {
  await query(
    `UPDATE categories
     SET name = ?, slug = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, slug, Number(sortOrder) || 0, id]
  );

  return { id, name, slug };
}

/**
 * Deletes a category (if not marked permanent)
 */
export async function deleteCategory(id) {
  const category = await queryOne("SELECT is_permanent FROM categories WHERE id = ?", [id]);
  if (category?.is_permanent) {
    throw new Error("স্থায়ী ক্যাটাগরি মুছে ফেলা সম্ভব নয়।");
  }

  return await withTransaction(async (tx) => {
    await tx.query("UPDATE articles SET category_id = NULL, subcategory_id = NULL WHERE category_id = ?", [id]);
    await tx.query("DELETE FROM subcategories WHERE category_id = ?", [id]);
    return await tx.query("DELETE FROM categories WHERE id = ?", [id]);
  });
}

/**
 * Creates a new subcategory under an existing category
 */
export async function createSubcategory({ categoryId, name, slug, sortOrder = 0 }) {
  const category = await queryOne(
    "SELECT is_permanent, slug FROM categories WHERE id = ?",
    [categoryId]
  );

  if (category?.is_permanent || category?.slug === "latest" || category?.slug === "handpicked") {
    throw new Error("স্থায়ী ক্যাটাগরির অধীনে সাব-ক্যাটাগরি যুক্ত করা সম্ভব নয়।");
  }

  const id = `sub_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  await query(
    `INSERT INTO subcategories (id, category_id, name, slug, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, categoryId, name, slug, Number(sortOrder) || 0]
  );

  return { id, categoryId, name, slug };
}

/**
 * Deletes a subcategory
 */
export async function deleteSubcategory(id) {
  return await withTransaction(async (tx) => {
    await tx.query("UPDATE articles SET subcategory_id = NULL WHERE subcategory_id = ?", [id]);
    return await tx.query("DELETE FROM subcategories WHERE id = ?", [id]);
  });
}

/**
 * Saves a batch of categories and their subcategories from the browser state.
 * Fully atomic transaction: updates existing ones, deletes removed dynamic categories,
 * inserts new ones, and maintains foreign key consistency.
 */
export async function saveCategoriesBatch(categoriesList = []) {
  return await withTransaction(async (tx) => {
    // 1. Fetch current dynamic categories in database
    const currentDbCats = await tx.query(
      "SELECT id, slug, is_permanent FROM categories WHERE is_permanent = 0 AND slug NOT IN ('latest', 'handpicked')"
    );
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
        await tx.query("UPDATE articles SET category_id = NULL, subcategory_id = NULL WHERE category_id = ?", [dbCat.id]);
        await tx.query("DELETE FROM subcategories WHERE category_id = ?", [dbCat.id]);
        await tx.query("DELETE FROM categories WHERE id = ?", [dbCat.id]);
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
        await tx.query(
          `INSERT INTO categories (id, name, slug, is_permanent, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [catId, cat.name, cat.slug, sortOrder]
        );
      } else {
        await tx.query(
          `UPDATE categories
           SET name = ?, slug = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [cat.name, cat.slug, sortOrder, catId]
        );

        // Keep denormalized article category names in sync
        await tx.query(
          "UPDATE articles SET category_name = ?, category_slug = ? WHERE category_id = ?",
          [cat.name, cat.slug, catId]
        );
      }

      // Handle subcategories for this category
      const incomingSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
      const currentDbSubs = await tx.query(
        "SELECT id FROM subcategories WHERE category_id = ?",
        [catId]
      );
      const currentSubIds = new Set((currentDbSubs || []).map((s) => s.id));
      const incomingSubIds = new Set(
        incomingSubs
          .map((s) => s.id)
          .filter((id) => id && !String(id).startsWith("temp_"))
      );

      // Delete removed subcategories
      for (const subId of currentSubIds) {
        if (!incomingSubIds.has(subId)) {
          await tx.query("UPDATE articles SET subcategory_id = NULL WHERE subcategory_id = ?", [subId]);
          await tx.query("DELETE FROM subcategories WHERE id = ?", [subId]);
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
          await tx.query(
            `INSERT INTO subcategories (id, category_id, name, slug, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [subId, catId, sub.name, sub.slug, subSortOrder]
          );
        } else {
          await tx.query(
            `UPDATE subcategories
             SET name = ?, slug = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [sub.name, sub.slug, subSortOrder, subId]
          );

          // Keep denormalized article subcategory names in sync
          await tx.query(
            "UPDATE articles SET subcategory_name = ? WHERE subcategory_id = ?",
            [sub.name, subId]
          );
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
  });
}
