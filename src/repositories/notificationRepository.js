import { query, queryOne, withTransaction } from "@/lib/db";

export async function createNotification({
  userId,
  type,
  title,
  message,
  targetType = null,
  targetId = null,
  targetSlug = null,
  actionBy = null,
}) {
  if (!userId || !type || !title) return null;

  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await query(
    `INSERT INTO notifications (
      id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
    [id, userId, type, title, message, targetType, targetId, targetSlug, actionBy]
  );

  return { id, userId, type, title, message, isRead: 0 };
}

export async function getUserNotifications(userId, { limit = 20, offset = 0, filter = "all", search = "" } = {}) {
  if (!userId) return [];
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
  const safeOffset = Math.max(0, Number(offset) || 0);

  let whereClauses = ["user_id = ?"];
  const params = [userId];

  if (filter === "unread") {
    whereClauses.push("is_read = 0");
  } else if (filter === "articles") {
    whereClauses.push("type LIKE 'article_%'");
  } else if (filter === "requests") {
    whereClauses.push("(type LIKE 'request_%' OR type LIKE 'admin_%')");
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    whereClauses.push("(LOWER(title) LIKE ? OR LOWER(message) LIKE ?)");
    params.push(term, term);
  }

  const sql = `
    SELECT *
    FROM notifications
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  params.push(safeLimit, safeOffset);

  const rows = await query(sql, params);
  return rows || [];
}

export async function getUserNotificationsCount(userId, { filter = "all", search = "" } = {}) {
  if (!userId) return 0;

  let whereClauses = ["user_id = ?"];
  const params = [userId];

  if (filter === "unread") {
    whereClauses.push("is_read = 0");
  } else if (filter === "articles") {
    whereClauses.push("type LIKE 'article_%'");
  } else if (filter === "requests") {
    whereClauses.push("(type LIKE 'request_%' OR type LIKE 'admin_%')");
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    whereClauses.push("(LOWER(title) LIKE ? OR LOWER(message) LIKE ?)");
    params.push(term, term);
  }

  const sql = `SELECT COUNT(*) as total FROM notifications WHERE ${whereClauses.join(" AND ")}`;
  const row = await queryOne(sql, params);
  return Number(row?.total || 0);
}

export async function getUnreadNotificationCount(userId) {
  if (!userId) return 0;
  const row = await queryOne(
    "SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  return Number(row?.unread_count || 0);
}

export async function markNotificationAsRead(id, userId) {
  if (!id || !userId) return false;
  await query(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return true;
}

export async function markAllNotificationsAsRead(userId) {
  if (!userId) return false;
  await query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
    [userId]
  );
  return true;
}

export async function notifySubEditorsOfReporterArticle({
  articleId,
  headline,
  slug,
  reporterUsername = "reporter",
}) {
  try {
    const subEditors = await query(
      "SELECT id, username FROM users WHERE role = 'sub_editor' AND status = 'active'"
    );

    if (!subEditors || subEditors.length === 0) {
      return [];
    }

    const title = "প্রতিবেদকের নতুন সংবাদ জমা";
    const message = `প্রতিবেদক @${reporterUsername} পর্যালোচনার জন্য নতুন সংবাদ "${headline}" জমা দিয়েছেন।`;

    const createdIds = [];
    for (const sub of subEditors) {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await query(
        `INSERT INTO notifications (
          id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at
        ) VALUES (?, ?, 'article_submitted', ?, ?, 'article', ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
        [id, sub.id, title, message, articleId, slug, reporterUsername]
      );
      createdIds.push(id);
    }

    return createdIds;
  } catch (err) {
    console.error("[notifySubEditorsOfReporterArticle error]:", err);
    return [];
  }
}

export async function notifyAdmins({
  type,
  title,
  message,
  targetType = null,
  targetId = null,
  targetSlug = null,
  actionBy = null,
  excludeUserId = null,
}) {
  try {
    let sql = "SELECT id FROM users WHERE role = 'admin' AND status = 'active'";
    const params = [];
    if (excludeUserId) {
      sql += " AND id != ?";
      params.push(excludeUserId);
    }
    const admins = await query(sql, params);
    if (!admins || admins.length === 0) return [];

    const createdIds = [];
    for (const admin of admins) {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await query(
        `INSERT INTO notifications (
          id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
        [id, admin.id, type, title, message, targetType, targetId, targetSlug, actionBy]
      );
      createdIds.push(id);
    }
    return createdIds;
  } catch (err) {
    console.error("[notifyAdmins error]:", err);
    return [];
  }
}

export async function notifySuperAdmins({
  type,
  title,
  message,
  targetType = null,
  targetId = null,
  targetSlug = null,
  actionBy = null,
}) {
  try {
    const superAdmins = await query(
      "SELECT id FROM users WHERE (role = 'super_admin' OR role = 'superadmin') AND status = 'active'"
    );
    if (!superAdmins || superAdmins.length === 0) return [];

    const createdIds = [];
    for (const sa of superAdmins) {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await query(
        `INSERT INTO notifications (
          id, user_id, type, title, message, target_type, target_id, target_slug, action_by, is_read, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
        [id, sa.id, type, title, message, targetType, targetId, targetSlug, actionBy]
      );
      createdIds.push(id);
    }
    return createdIds;
  } catch (err) {
    console.error("[notifySuperAdmins error]:", err);
    return [];
  }
}


