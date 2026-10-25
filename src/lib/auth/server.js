import { getAuthCookie } from "./cookies";
import { verifyJwtToken } from "./jwt";
import { getUserById } from "@/repositories/userRepository";

/**
 * Server-only authentication utilities (Node.js & Server Components)
 */

export const DEFAULT_DEV_USER = {
  id: "usr_superadmin",
  name: "প্রধান সম্পাদক",
  email: "admin@aloshbe.com",
  role: "super_admin",
  status: "active",
};

/**
 * Resolves current logged-in user from HTTP-only cookie with Edge-compliant JWT verification.
 * Strictly verifies against the database to ensure deleted or wiped users are instantly invalidated.
 */
export async function getCurrentUser() {
  try {
    const token = await getAuthCookie();
    if (!token) return null;

    const payload = await verifyJwtToken(token);
    if (!payload || !payload.sub) return null;

    // Check user exists and is active in the database
    const dbUser = await getUserById(payload.sub);
    if (!dbUser || dbUser.status !== "active") {
      return null;
    }

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      status: dbUser.status,
      mustChangePassword: Boolean(dbUser.must_change_password),
      avatar: dbUser.avatar || null,
      bio: dbUser.bio || null,
    };
  } catch (_e) {
    return null;
  }
}
