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

