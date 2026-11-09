import { query, queryOne } from "@/lib/db";

export async function getPaginatedUsers({ limit = 20, offset = 0, role = "all", search = "" } = {}) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
  const safeOffset = Math.max(0, Number(offset) || 0);

  const conditions = [];
  const params = [];

  if (role && role !== "all") {
    conditions.push("role = ?");
    params.push(role);
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    conditions.push("(LOWER(username) LIKE ? OR LOWER(COALESCE(full_name, name, '')) LIKE ? OR LOWER(email) LIKE ?)");
    params.push(term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await query(
    `SELECT id, username, full_name, COALESCE(full_name, name, username) as name, email, phone, role, status, must_change_password, avatar, bio, created_at 
     FROM users 
     ${whereClause}
     ORDER BY 
       CASE role
         WHEN 'super_admin' THEN 1
         WHEN 'superadmin' THEN 1
         WHEN 'admin' THEN 2
         WHEN 'editor_in_chief' THEN 3
         WHEN 'editor' THEN 4
         WHEN 'sub_editor' THEN 5
         WHEN 'reporter' THEN 6
         ELSE 7
       END ASC,
       created_at ASC
     LIMIT ? OFFSET ?`,
    [...params, safeLimit, safeOffset]
  );
  return rows || [];
}

export async function getUsersCount({ role = "all", search = "" } = {}) {
  const conditions = [];
  const params = [];

  if (role && role !== "all") {
    conditions.push("role = ?");
    params.push(role);
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    conditions.push("(LOWER(username) LIKE ? OR LOWER(COALESCE(full_name, name, '')) LIKE ? OR LOWER(email) LIKE ?)");
    params.push(term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const row = await queryOne(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
  return Number(row?.total || 0);
}




export async function getAllUsers() {
  const rows = await query(
    `SELECT id, username, full_name, COALESCE(full_name, name, username) as name, email, phone, role, status, must_change_password, avatar, bio, created_at 
     FROM users 
     ORDER BY 
       CASE role
         WHEN 'super_admin' THEN 1
         WHEN 'superadmin' THEN 1
         WHEN 'admin' THEN 2
         WHEN 'editor_in_chief' THEN 3
         WHEN 'editor' THEN 4
         WHEN 'sub_editor' THEN 5
         WHEN 'reporter' THEN 6
         ELSE 7
       END ASC,
       created_at ASC`
  );
  return rows || [];
}

export async function getUserById(id) {
  if (!id) return null;
  return await queryOne(
    `SELECT id, username, full_name, COALESCE(full_name, name, username) as name, email, phone, password, role, status, must_change_password, avatar, bio, created_at 
     FROM users 
     WHERE id = ?`,
    [id]
  );
}

export async function getUserByUsername(username) {
  if (!username) return null;
  return await queryOne(
    `SELECT id, username, full_name, COALESCE(full_name, name, username) as name, email, phone, password, role, status, must_change_password, avatar, bio 
     FROM users 
     WHERE LOWER(username) = LOWER(?)`,
    [username.trim()]
  );
}

export async function getUserByEmail(email) {
  if (!email) return null;
  return await queryOne(
    `SELECT id, username, full_name, COALESCE(full_name, name, username) as name, email, phone, password, role, status, must_change_password, avatar, bio 
     FROM users 
     WHERE LOWER(email) = LOWER(?)`,
    [email.trim()]
  );
}



export async function getUserByUsernameOrEmail(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  return await queryOne(
    `SELECT id, username, full_name, COALESCE(full_name, name, username) as name, email, phone, password, role, status, must_change_password, avatar, bio 
     FROM users 
     WHERE LOWER(username) = ? OR (email IS NOT NULL AND email != '' AND LOWER(email) = ?)
     LIMIT 1`,
    [clean, clean]
  );
}



export async function createUser({
  username,
  fullName = "",
  name = "",
  email = "",
  phone = "",
  password = "",
  role = "reporter",
  status = "active",
  mustChangePassword = 0,
  bio = "",
}) {
  if (role === "super_admin" || role === "admin") {
    throw new Error("সুপার অ্যাডমিন ও অ্যাডমিন একক ভূমিকা; এই পদে নতুন অ্যাকাউন্ট তৈরি করা যাবে না।");
  }

  const cleanUsername = (username || "").trim().toLowerCase();
  if (!cleanUsername) {
    throw new Error("ইউজারনেম আবশ্যক।");
  }

  const cleanFullName = (fullName || name || "").trim();
  const displayName = cleanFullName || cleanUsername;
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPhone = (phone || "").trim();

  const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  await query(
    `INSERT INTO users (id, username, full_name, name, email, phone, password, role, status, must_change_password, bio, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, cleanUsername, cleanFullName || null, displayName, cleanEmail || null, cleanPhone || null, password, role, status, mustChangePassword ? 1 : 0, bio]
  );

  return {
    id,
    username: cleanUsername,
    full_name: cleanFullName || null,
    name: displayName,
    email: cleanEmail,
    phone: cleanPhone,
    role,
    status,
    must_change_password: mustChangePassword ? 1 : 0,
  };
}



export async function updateUserProfile(id, { fullName, email, phone, bio = "", avatar = null }) {
  const cleanName = (fullName || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPhone = (phone || "").trim();

  await query(
    `UPDATE users 
     SET full_name = ?, name = ?, email = ?, phone = ?, bio = ?, avatar = COALESCE(?, avatar), updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [cleanName || null, cleanName || null, cleanEmail || null, cleanPhone || null, bio, avatar, id]
  );

  return { id, full_name: cleanName, email: cleanEmail, phone: cleanPhone, bio };
}



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



export async function updateUserPassword(id, password) {
  await query(
    "UPDATE users SET password = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [password, id]
  );
  return { id, success: true };
}
