import { getAuthCookie } from "./cookies";
import { verifyJwtToken } from "./jwt";
import { getUserById } from "@/repositories/userRepository";




export const DEFAULT_DEV_USER = {
  id: "usr_superadmin",
  name: "superadmin",
  email: "admin@aloshbe.com",
  role: "super_admin",
  status: "active",
};



export async function getCurrentUser() {
  try {
    const token = await getAuthCookie();
    if (!token) return null;

    const payload = await verifyJwtToken(token);
    if (!payload || !payload.sub) return null;


    const dbUser = await getUserById(payload.sub);
    if (!dbUser || dbUser.status !== "active") {
      return null;
    }

    return {
      id: dbUser.id,
      username: dbUser.username,
      name: dbUser.full_name || dbUser.username,
      fullName: dbUser.full_name || "",
      email: dbUser.email || "",
      phone: dbUser.phone || "",
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
