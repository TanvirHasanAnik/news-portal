"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { loginSchema, formatZodError } from "@/schemas";
import { getUserByEmail, updateUserPassword } from "@/repositories/userRepository";
import { createJwtToken } from "@/lib/auth/jwt";
import { setAuthCookie, removeAuthCookie } from "@/lib/auth/cookies";
import { recordAuditLog } from "@/repositories/analyticsRepository";

/**
 * Server Action for User Login (TiDB + bcryptjs)
 */
export async function loginAction(prevState, formData) {
  try {
    const rawData = {
      email: formData.get("email")?.toString() || "",
      password: formData.get("password")?.toString() || "",
    };

    const validated = loginSchema.parse(rawData);

    // 1. Fetch user from TiDB repository
    const user = await getUserByEmail(validated.email);
    if (!user || !user.password) {
      return {
        success: false,
        message: "প্রদত্ত ইমেইল বা পাসওয়ার্ড সঠিক নয়।",
      };
    }

    if (user.status !== "active") {
      return {
        success: false,
        message:
          "আপনার অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে যোগাযোগ করুন।",
      };
    }

    // 2. Verify password with bcryptjs
    let isMatch = false;
    const isBcryptHash =
      user.password.startsWith("$2a$") ||
      user.password.startsWith("$2b$") ||
      user.password.startsWith("$2y$");

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(validated.password, user.password);
    } else {
      // Legacy plaintext comparison fallback -> auto-upgrade to bcrypt (salt rounds: 12)
      if (user.password === validated.password) {
        isMatch = true;
        const newHash = await bcrypt.hash(validated.password, 12);
        await updateUserPassword(user.id, newHash);
      }
    }

    if (!isMatch) {
      return {
        success: false,
        message: "প্রদত্ত ইমেইল বা পাসওয়ার্ড সঠিক নয়।",
      };
    }

    // 3. Create Edge-compliant JWT Token
    const token = await createJwtToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      mustChangePassword: Boolean(user.must_change_password),
    });

    // 4. Store in HTTP-only Cookie
    await setAuthCookie(token);

    // 5. Audit Log
    try {
      await recordAuditLog({
        userId: user.id,
        action: "login",
        targetType: "user",
        targetId: user.id,
        details: { email: user.email, role: user.role },
      });
    } catch (_auditErr) {
      // Non-blocking
    }

    return {
      success: true,
      redirectUrl: "/admin",
    };
  } catch (error) {
    return {
      success: false,
      message: formatZodError(error, "লগইন করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।"),
    };
  }
}

/**
 * Server Action for User Logout
 */
export async function logoutAction() {
  await removeAuthCookie();
  redirect("/admin/login");
}
