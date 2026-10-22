import { getDb } from "@/lib/db";

/**
 * Admin Requests Repository
 * Handles workflow requests from Admin to Super Admin (new users, disable user, role change, curation)
 */

export async function getAllAdminRequests({ status } = {}) {
  const db = await getDb();
  let sql = `
    SELECT r.*, 
           u.name as requester_name, 
           u.email as requester_email, 
           t.name as target_user_name,
           t.email as target_user_email
    FROM admin_requests r
    LEFT JOIN users u ON r.requester_id = u.id
    LEFT JOIN users t ON r.target_user_id = t.id
  `;
  const params = [];

  if (status) {
    sql += " WHERE r.status = ?";
    params.push(status);
  }

  sql += " ORDER BY r.created_at DESC";

  const { results } = await db.prepare(sql).bind(...params).all();
  return results || [];
}

export async function createAdminRequest({
  requesterId = "usr_reporter",
  requestType,
  targetUserId = null,
  payload = null,
}) {
  const db = await getDb();
  const id = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const payloadStr = typeof payload === "object" ? JSON.stringify(payload) : payload;

  await db
    .prepare(
      `INSERT INTO admin_requests (id, requester_id, request_type, target_user_id, payload, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .bind(id, requesterId, requestType, targetUserId, payloadStr)
    .run();

  return { id, status: "pending" };
}

export async function updateAdminRequestStatus(id, { status, reviewedBy = "usr_superadmin", reviewerNote = "" }) {
  const db = await getDb();

  await db
    .prepare(
      `UPDATE admin_requests 
       SET status = ?, reviewed_by = ?, reviewer_note = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(status, reviewedBy, reviewerNote, id)
    .run();

  // If approved and was a user action, apply change
  if (status === "approved") {
    const req = await db.prepare("SELECT * FROM admin_requests WHERE id = ?").bind(id).first();
    if (req) {
      try {
        const details = req.payload ? JSON.parse(req.payload) : {};
        if (req.request_type === "disable_user" && req.target_user_id) {
          await db.prepare("UPDATE users SET status = 'disabled' WHERE id = ?").bind(req.target_user_id).run();
        } else if (req.request_type === "role_change" && req.target_user_id && details.newRole) {
          await db.prepare("UPDATE users SET role = ? WHERE id = ?").bind(details.newRole, req.target_user_id).run();
        } else if (req.request_type === "new_user" && details.email && details.name) {
          const newUserId = `usr_${Date.now().toString(36)}`;
          await db.prepare(
            "INSERT INTO users (id, name, email, role, status) VALUES (?, ?, ?, ?, 'active')"
          ).bind(newUserId, details.name, details.email, details.role || "reporter").run();
        }
      } catch (_e) {}
    }
  }

  return { id, status };
}

