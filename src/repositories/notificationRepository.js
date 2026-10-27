import { query, queryOne, withTransaction } from "@/lib/db";

/**
 * Notifications Repository
 * Zero-ORM, TiDB/MySQL direct repository for system & workflow notifications.
 */

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

export async function getUserNotifications(userId, { limit = 50, filter = "all" } = {}) {
  if (!userId) return [];
  const safeLimit = Math.min(Math.max(1, Number(limit) || 50), 100);

  let whereClauses = ["user_id = ?"];
  const params = [userId];

  if (filter === "unread") {
    whereClauses.push("is_read = 0");
  } else if (filter === "articles") {
    whereClauses.push("type LIKE 'article_%'");
  } else if (filter === "requests") {
    whereClauses.push("type LIKE 'request_%'");
  }

  const sql = `
    SELECT *
    FROM notifications
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY created_at DESC
    LIMIT ?
  `;
  params.push(safeLimit);

  const rows = await query(sql, params);
  return rows || [];
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

/**
 * Notifies all active sub-editors when a reporter submits a new article for review
 */
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

