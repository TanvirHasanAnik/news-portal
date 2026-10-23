import { query, queryOne, withTransaction } from "@/lib/db";

/**
 * Comments Repository
 * Raw MySQL (mysql2/promise) data layer for Cloudflare Workers (workerd) & TiDB.
 * Implements structured keyset/offset pagination and covered index queries to minimize TiDB RU costs.
 */

/**
 * Fetch approved comments for an article with structured pagination
 */
export async function getCommentsByArticleId(articleId, { limit = 20, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
  const safeOffset = Math.max(0, Number(offset) || 0);

  const rows = await query(
    `SELECT id, article_id, user_name, content, parent_id, created_at 
     FROM comments 
     WHERE article_id = ? AND status = 'approved' 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [articleId, safeLimit, safeOffset]
  );

  return rows || [];
}

/**
 * Create a new comment (defaults to pending moderation)
 */
export async function createComment({ articleId, userId = null, userName, userEmail = null, content, parentId = null }) {
  const result = await query(
    `INSERT INTO comments (article_id, user_id, user_name, user_email, content, status, parent_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [articleId, userId, userName, userEmail, content, parentId]
  );

  return {
    id: result?.insertId,
    articleId,
    userName,
    status: "pending",
  };
}

/**
 * Update comment moderation status (e.g. approved, rejected, spam)
 */
export async function updateCommentStatus(commentId, status) {
  await query(
    "UPDATE comments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, commentId]
  );

  return { id: commentId, status };
}

/**
 * Delete comment
 */
export async function deleteComment(commentId) {
  return await query("DELETE FROM comments WHERE id = ?", [commentId]);
}

