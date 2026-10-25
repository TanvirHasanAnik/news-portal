import { query, queryOne } from "@/lib/db";

/**
 * User Repository
 * Raw MySQL (mysql2/promise) data layer for Cloudflare Workers (workerd) & TiDB.
 */

export async function getAllUsers() {
  const rows = await query(
    "SELECT id, name, email, role, status, must_change_password, avatar, bio, created_at FROM users ORDER BY created_at ASC"
  );
  return rows || [];
}

export async function getUserById(id) {
  return await queryOne(
    "SELECT id, name, email, role, status, must_change_password, avatar, bio FROM users WHERE id = ?",
    [id]
  );
}

export async function getUserByEmail(email) {
  if (!email) return null;
  return await queryOne(
    "SELECT id, name, email, password, role, status, must_change_password, avatar, bio FROM users WHERE LOWER(email) = LOWER(?)",
    [email.trim()]
  );
}

/**
 * Creates a new user with initial email, password, and role
 */
export async function createUser({
  name,
  email,
  password = "",
  role = "reporter",
  status = "active",
  mustChangePassword = 0,
  bio = "",
}) {
  if (role === "super_admin" || role === "admin") {
    throw new Error("সুপার অ্যাডমিন ও অ্যাডমিন একক ভূমিকা; এই পদে নতুন অ্যাকাউন্ট তৈরি করা যাবে না।");
  }

  const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  await query(
    `INSERT INTO users (id, name, email, password, role, status, must_change_password, bio, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, name, email.trim().toLowerCase(), password, role, status, mustChangePassword ? 1 : 0, bio]
  );

  return { id, name, email, role, status, must_change_password: mustChangePassword ? 1 : 0 };
}

/**
 * Updates a user's role
 */
export async function updateUserRole(id, role) {
  if (role === "super_admin" || role === "admin") {
    throw new Error("কাউকে সুপার অ্যাডমিন বা অ্যাডমিন পদে পরিবর্তন করা যাবে না।");
  }

  const target = await getUserById(id);
  if (target && (target.role === "super_admin" || target.role === "admin")) {
    throw new Error("স্থায়ী সুপার অ্যাডমিন বা অ্যাডমিনের পদবী পরিবর্তন করা যাবে না।");
  }

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
  const target = await getUserById(id);
  if (target && (target.role === "super_admin" || target.role === "admin")) {
    throw new Error("সুপার অ্যাডমিন বা অ্যাডমিন অ্যাকাউন্ট নিষ্ক্রিয় করা সম্ভব নয়।");
  }

  await query(
    "UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, id]
  );
  return { id, status };
}

/**
 * Updates a user's password and clears must_change_password flag
 */
export async function updateUserPassword(id, password) {
  await query(
    "UPDATE users SET password = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [password, id]
  );
  return { id, success: true };
}
