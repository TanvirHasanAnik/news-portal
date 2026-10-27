import { getDb, query, queryOne, withTransaction } from "@/lib/db";

/**
 * Admin Requests Repository
 * Raw MySQL (mysql2/promise) data layer for Cloudflare Workers (workerd) & TiDB.
 * Handles workflow requests from Admin to Super Admin (new users, disable user, role change, curation)
 */

export async function getAllAdminRequests({ status } = {}) {
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

  const rows = await query(sql, params);
  return rows || [];
}

export async function createAdminRequest({
  requesterId = "usr_reporter",
  requestType,
  targetUserId = null,
  payload = null,
}) {
  const id = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const payloadStr = typeof payload === "object" ? JSON.stringify(payload) : payload;

  await query(
    `INSERT INTO admin_requests (id, requester_id, request_type, target_user_id, payload, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, requesterId, requestType, targetUserId, payloadStr]
  );

  return { id, status: "pending" };
}

export async function updateAdminRequestStatus(id, { status, reviewedBy = "usr_superadmin", reviewerNote = "" }) {
  return await withTransaction(async (tx) => {
    await tx.query(
      `UPDATE admin_requests 
       SET status = ?, reviewed_by = ?, reviewer_note = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, reviewedBy, reviewerNote, id]
    );

    // If approved and was a user action, apply change within the same atomic transaction
    const req = await tx.queryOne("SELECT * FROM admin_requests WHERE id = ?", [id]);
    if (req) {
      if (status === "approved") {
        try {
          const details = req.payload ? JSON.parse(req.payload) : {};
          if (req.request_type === "disable_user" && req.target_user_id) {
            await tx.query("UPDATE users SET status = 'disabled' WHERE id = ?", [req.target_user_id]);
          } else if (req.request_type === "role_change" && req.target_user_id && details.newRole) {
            await tx.query("UPDATE users SET role = ? WHERE id = ?", [details.newRole, req.target_user_id]);
          } else if (req.request_type === "new_user" && details.email && details.name) {
            const newUserId = `usr_${Date.now().toString(36)}`;
            await tx.query(
              `INSERT INTO users (id, name, email, role, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [newUserId, details.name, details.email, details.role || "reporter"]
            );
          }
        } catch (_parseErr) {
          // payload parsing error
        }
      }

      // Create workflow notification for requester
      if (req.requester_id) {
        const isApproved = status === "approved";
        const typeLabels = {
          new_user: "নতুন ব্যবহারকারী তৈরির আবেদন",
          disable_user: "ব্যবহারকারী নিষ্ক্রিয়করণের আবেদন",
          role_change: "রোল পরিবর্তনের আবেদন",
        };
        const reqLabel = typeLabels[req.request_type] || "প্রশাসনিক আবেদন";
        await tx.query(
          `INSERT INTO notifications (id, user_id, type, title, message, target_type, target_id, action_by, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, 'request', ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            req.requester_id,
            isApproved ? "request_approved" : "request_rejected",
            isApproved ? "প্রশাসনিক আবেদন অনুমোদিত হয়েছে" : "প্রশাসনিক আবেদন প্রত্যাখ্যাত হয়েছে",
            isApproved
              ? `আপনার "${reqLabel}" সুপার অ্যাডমিন কর্তৃক অনুমোদিত হয়েছে।`
              : `আপনার "${reqLabel}" প্রত্যাখ্যাত হয়েছে। ${reviewerNote ? `নোট: ${reviewerNote}` : ""}`,
            id,
            reviewedBy,
          ]
        );
      }
    }

    return { id, status };
  });
}
