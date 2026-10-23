import { getDb, query, queryOne } from "@/lib/db";

/**
 * User Repository
 * Raw MySQL (mysql2/promise) data layer for Cloudflare Workers (workerd) & TiDB.
 */

export async function getAllUsers() {
  const rows = await query(
    "SELECT id, name, email, role, status, avatar, bio, created_at FROM users ORDER BY created_at ASC"
  );
  return rows || [];
}

export async function getUserById(id) {
  return await queryOne(
    "SELECT id, name, email, role, status, avatar, bio FROM users WHERE id = ?",
    [id]
  );
}

/**
 * Creates a new user with initial email, password, and role
 */
export async function createUser({ name, email, password = "", role = "reporter", status = "active", bio = "" }) {
  const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  await query(
    `INSERT INTO users (id, name, email, password, role, status, bio, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, name, email.trim().toLowerCase(), password, role, status, bio]
  );

  return { id, name, email, role, status };
}

/**
 * Updates a user's role
 */
export async function updateUserRole(id, role) {
  await query(
    "UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [role, id]
  );
  return { id, role };
}

/**
 * Updates a user's status (active / disabled)
 */
export async function updateUserStatus(id, status) {
  await query(
    "UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, id]
  );
  return { id, status };
}
