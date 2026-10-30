import { getDb, query, queryOne, withTransaction } from "@/lib/db";




export const FALLBACK_CATEGORY = {
  id: "cat_others",
  name: "অন্যান্য",
  slug: "others",
  is_permanent: 1,
  sort_order: 9999,
};

export async function getFallbackCategory() {
  let cat = await queryOne("SELECT * FROM categories WHERE slug = 'others' OR id = 'cat_others'");
  if (!cat) {
    await query(
      "INSERT INTO categories (id, name, slug, is_permanent, sort_order) VALUES ('cat_others', 'অন্যান্য', 'others', 1, 9999) ON DUPLICATE KEY UPDATE name = 'অন্যান্য', is_permanent = 1, sort_order = 9999"
    );
    cat = await queryOne("SELECT * FROM categories WHERE slug = 'others' OR id = 'cat_others'");
  }
  return cat || FALLBACK_CATEGORY;
}

export async function ensureValidCategory(categoryId, categorySlug) {
  let cat = null;
  if (categorySlug && categorySlug !== "latest" && categorySlug !== "handpicked") {
    cat = await getCategoryBySlug(categorySlug);
  }
  if (!cat && categoryId) {
    cat = await queryOne("SELECT * FROM categories WHERE id = ?", [categoryId]);
  }
  if (!cat || cat.slug === "latest" || cat.slug === "handpicked") {
    cat = await getFallbackCategory();
  }
  return cat;
}

export async function getAllCategories() {
  const rows = await query("SELECT * FROM categories ORDER BY (slug = 'others') ASC, sort_order ASC, name ASC");
  return rows || [];
}



export async function getDynamicCategories() {
  const rows = await query(
    "SELECT * FROM categories WHERE slug NOT IN ('latest', 'handpicked') ORDER BY (slug = 'others') ASC, sort_order ASC, name ASC"
  );
  return rows || [];
}



export async function getPermanentCategories() {
  const rows = await query(
    "SELECT * FROM categories WHERE is_permanent = 1 OR slug IN ('latest', 'handpicked', 'others') ORDER BY (slug = 'others') ASC, sort_order ASC, name ASC"
  );
  return rows || [];
}



export async function getDynamicCategoriesWithSubcategories() {
  const allWithSubs = await getAllCategoriesWithSubcategories();
  const dynamic = allWithSubs.filter(
    (c) => !c.is_permanent && c.slug !== "latest" && c.slug !== "handpicked" && c.slug !== "others"
  );
  const others = allWithSubs.find((c) => c.slug === "others");
  return others ? [...dynamic, others] : dynamic;
}

export async function getAllCategoriesWithSubcategories() {
  try {
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
  } catch (error) {
    console.error("[Category] Error loading categories with subcategories:", error?.message || error);
    return [];
  }
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



export async function createCategory({ name, slug, sortOrder = 0, isPermanent = 0 }) {
  const id = `cat_${slug.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString(36)}`;

  await query(
    `INSERT INTO categories (id, name, slug, is_permanent, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, name, slug, isPermanent ? 1 : 0, Number(sortOrder) || 0]
  );

  return { id, name, slug };
}



export async function updateCategory(id, { name, slug, sortOrder }) {
  await query(
    `UPDATE categories
     SET name = ?, slug = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, slug, Number(sortOrder) || 0, id]
  );

  return { id, name, slug };
}



export async function deleteCategory(id) {
  const category = await queryOne("SELECT is_permanent, slug FROM categories WHERE id = ?", [id]);
  if (category?.is_permanent || category?.slug === "latest" || category?.slug === "handpicked" || category?.slug === "others") {
    throw new Error("স্থায়ী ক্যাটাগরি মুছে ফেলা সম্ভব নয়।");
  }

  const fallback = await getFallbackCategory();

  return await withTransaction(async (tx) => {
    await tx.query(
      "UPDATE articles SET category_id = ?, category_name = ?, category_slug = ?, subcategory_id = NULL, subcategory_name = NULL WHERE category_id = ? OR category_slug = ?",
      [fallback.id, fallback.name, fallback.slug, id, category.slug]
    );
    await tx.query(
      "UPDATE analytics_page_views SET category_slug = ?, subcategory_name = NULL WHERE category_slug = ?",
      [fallback.slug, category.slug]
    );
    await tx.query("DELETE FROM subcategories WHERE category_id = ?", [id]);
    return await tx.query("DELETE FROM categories WHERE id = ?", [id]);
  });
}



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



export async function deleteSubcategory(id) {
  const sub = await queryOne("SELECT name FROM subcategories WHERE id = ?", [id]);
  return await withTransaction(async (tx) => {
    await tx.query("UPDATE articles SET subcategory_id = NULL, subcategory_name = NULL WHERE subcategory_id = ?", [id]);
    if (sub?.name) {
      await tx.query("UPDATE analytics_page_views SET subcategory_name = NULL WHERE subcategory_name = ?", [sub.name]);
    }
    return await tx.query("DELETE FROM subcategories WHERE id = ?", [id]);
  });
}



export async function saveCategoriesBatch(categoriesList = []) {
  return await withTransaction(async (tx) => {

    const currentDbCats = await tx.query(
      "SELECT id, slug, is_permanent FROM categories WHERE is_permanent = 0 AND slug NOT IN ('latest', 'handpicked', 'others')"
    );
    const currentDbCatIds = new Set((currentDbCats || []).map((c) => c.id));


    const incomingDynamic = categoriesList.filter(
      (c) => !c.is_permanent && c.slug !== "latest" && c.slug !== "handpicked" && c.slug !== "others"
    );
    const incomingCatIds = new Set(
      incomingDynamic
        .map((c) => c.id)
        .filter((id) => id && !String(id).startsWith("temp_"))
    );


    for (const dbCat of currentDbCats || []) {
      if (!incomingCatIds.has(dbCat.id)) {
        const fallback = await getFallbackCategory();
        await tx.query(
          "UPDATE articles SET category_id = ?, category_name = ?, category_slug = ?, subcategory_id = NULL, subcategory_name = NULL WHERE category_id = ? OR category_slug = ?",
          [fallback.id, fallback.name, fallback.slug, dbCat.id, dbCat.slug]
        );
        await tx.query(
          "UPDATE analytics_page_views SET category_slug = ?, subcategory_name = NULL WHERE category_slug = ?",
          [fallback.slug, dbCat.slug]
        );
        await tx.query("DELETE FROM subcategories WHERE category_id = ?", [dbCat.id]);
        await tx.query("DELETE FROM categories WHERE id = ?", [dbCat.id]);
      }
    }


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


        await tx.query(
          "UPDATE articles SET category_name = ?, category_slug = ? WHERE category_id = ?",
          [cat.name, cat.slug, catId]
        );
      }


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


      for (const subId of currentSubIds) {
        if (!incomingSubIds.has(subId)) {
          const sub = await tx.queryOne("SELECT name FROM subcategories WHERE id = ?", [subId]);
          await tx.query("UPDATE articles SET subcategory_id = NULL, subcategory_name = NULL WHERE subcategory_id = ?", [subId]);
          if (sub?.name) {
            await tx.query("UPDATE analytics_page_views SET subcategory_name = NULL WHERE subcategory_name = ?", [sub.name]);
          }
          await tx.query("DELETE FROM subcategories WHERE id = ?", [subId]);
        }
      }


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
