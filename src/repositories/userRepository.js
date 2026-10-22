import { getDb } from "@/lib/db";

/**
 * User Repository
 * Direct Cloudflare D1 / SQLite database queries
 */

export async function getAllUsers() {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT id, name, email, role, status, avatar, bio, created_at FROM users ORDER BY created_at ASC")
    .all();
  return results || [];
}

export async function getUserById(id) {
  const db = await getDb();
  return await db
    .prepare("SELECT id, name, email, role, status, avatar, bio FROM users WHERE id = ?")
    .bind(id)
    .first();
}

/**
 * Creates a new user or invites a user by email
 */
export async function createUser({ name, email, role = "reporter", status = "active", bio = "" }) {
  const db = await getDb();
  const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  await db
    .prepare(
      `INSERT INTO users (id, name, email, role, status, bio, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .bind(id, name, email.trim().toLowerCase(), role, status, bio)
    .run();

  return { id, name, email, role, status };
}

/**
 * Updates a user's role
 */
export async function updateUserRole(id, role) {
  const db = await getDb();
  await db
    .prepare("UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(role, id)
    .run();
  return { id, role };
}

/**
 * Updates a user's status (active / disabled)
 */
export async function updateUserStatus(id, status) {
  const db = await getDb();
  await db
    .prepare("UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(status, id)
    .run();
  return { id, status };
}


