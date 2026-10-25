import { recordAuditLog } from "@/repositories/analyticsRepository";
import { getUserByUsername, updateUserPassword } from "@/repositories/userRepository";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BCRYPT_SALT_ROUNDS = 12;

async function getAdminSecretKey() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env?.ADMIN_SECRET_KEY) {
      return ctx.env.ADMIN_SECRET_KEY.trim();
    }
  } catch (_e) {
    // Cloudflare context unavailable in pure Node.js
  }

  return (process.env.ADMIN_SECRET_KEY).trim();
}

export async function POST(request) {
  try {
    // 1. Verify Secret Key Header
    const configuredSecretKey = await getAdminSecretKey();

    const headerSecretKey =
      request.headers.get("x-secret-key") ||
      request.headers.get("X-Secret-Key");

    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    let bearerToken = null;
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      bearerToken = authHeader.substring(7).trim();
    }

    const providedKey = (headerSecretKey || "").trim();

    if (!providedKey || providedKey !== configuredSecretKey) {
      return NextResponse.json(
        {
          success: false,
          message: "An error occured!",
        },
        { status: 403 }
      );
    }

    // 2. Parse & Validate Request Body
    let body = {};
    try {
      body = await request.json();
    } catch (_err) {
      return NextResponse.json(
        {
          success: false,
          message: "অবৈধ রিকোয়েস্ট বডি (JSON ফরম্যাট আবশ্যক)।",
        },
        { status: 400 }
      );
    }

    const { username, newPassword } = body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "ইউজারনেম (username) ফিল্ডটি আবশ্যক।",
        },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
        },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // 3. Find target user by username
    const user = await getUserByUsername(cleanUsername);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: `"${cleanUsername}" ইউজারনেমের কোনো ব্যবহারকারী পাওয়া যায়নি।`,
        },
        { status: 404 }
      );
    }

    // 4. Role restriction: Only super_admin and admin passwords can be overridden via this endpoint
    if (user.role !== "super_admin" && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "এই অ্যান্ডপয়েন্টটি শুধুমাত্র সুপার অ্যাডমিন ও অ্যাডমিন অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তনের জন্য অনুমোদিত।",
        },
        { status: 403 }
      );
    }

    // 5. Hash new password and update in database
    const hashedPassword = await bcrypt.hash(newPassword.trim(), BCRYPT_SALT_ROUNDS);
    await updateUserPassword(user.id, hashedPassword);

    // 6. Record Audit Log for security monitoring
    try {
      await recordAuditLog({
        userId: user.id,
        action: "emergency_password_override",
        targetType: "user",
        targetId: user.id,
        details: {
          username: user.username,
          role: user.role,
          method: "secret_api_override",
        },
      });
    } catch (_auditErr) {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `"${user.username}" (${user.role}) অ্যাকাউন্টের পাসওয়ার্ড সফলভাবে ওভাররাইড করা হয়েছে।`,
      data: {
        username: user.username,
        role: user.role,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Emergency Password Override Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "পাসওয়ার্ড ওভাররাইড করতে সার্ভার সমস্যা দেখা দিয়েছে।",
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

