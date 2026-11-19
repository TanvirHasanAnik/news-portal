import { revalidatePath, revalidateTag } from "next/cache";
import { TAGS } from "@/lib/cache/tags";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const KV_KEY = "revalidate-all:last-call";
const RATE_LIMIT_WINDOW_MS = 30000;

async function getAdminSecretKey() {
  try {
    const cf = await getCloudflareContext({ async: true });
    if (cf?.env?.ADMIN_SECRET_KEY) {
      return cf.env.ADMIN_SECRET_KEY.trim();
    }
  } catch (_e) {}
  return (process.env.ADMIN_SECRET_KEY || "").trim();
}

export async function POST(request) {
  const configuredSecretKey = await getAdminSecretKey();
  const headerSecretKey =
    request.headers.get("x-secret-key") ||
    request.headers.get("X-Secret-Key");

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  let bearerToken = null;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    bearerToken = authHeader.substring(7).trim();
  }

  const providedKey = (headerSecretKey || bearerToken || "").trim();

  if (!configuredSecretKey || !providedKey || providedKey !== configuredSecretKey) {
    return Response.json(
      { ok: false, error: "Unauthorized" },
      { status: 403 }
    );
  }

  const now = Date.now();
  const isoTimestamp = new Date(now).toISOString();
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  let kv = null;
  try {
    const cf = await getCloudflareContext({ async: true });
    kv = cf?.env?.REVALIDATE_RATE_LIMIT_KV || null;
  } catch (err) {
    console.error("[REVALIDATE-ALL] Failed to retrieve Cloudflare context:", err);
  }

  if (!kv) {
    console.error("[REVALIDATE-ALL] REVALIDATE_RATE_LIMIT_KV binding is unavailable.");
    return Response.json(
      { ok: false, error: "Rate limit binding unavailable" },
      { status: 500 }
    );
  }

  const lastCallStr = await kv.get(KV_KEY);
  const lastMs = lastCallStr ? parseInt(lastCallStr, 10) : 0;

  if (now - lastMs < RATE_LIMIT_WINDOW_MS) {
    const retryAfterSeconds = Math.ceil(
      (RATE_LIMIT_WINDOW_MS - (now - lastMs)) / 1000
    );
    return Response.json(
      { ok: false, retryAfter: retryAfterSeconds },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  try {
    revalidatePath("/", "layout");
    revalidateTag(TAGS.HOMEPAGE);
    revalidateTag(TAGS.ARTICLES_PUBLISHED);
    revalidateTag(TAGS.CATEGORIES);
  } catch (revalidateErr) {
    console.error("[REVALIDATE-ALL] revalidatePath failed:", revalidateErr);
    return Response.json(
      { ok: false, error: revalidateErr.message || "Failed to revalidate layout" },
      { status: 500 }
    );
  }

  await kv.put(KV_KEY, String(now));

  console.warn(
    `[REVALIDATE-ALL] timestamp=${isoTimestamp} ip=${ip} user-agent=${userAgent}`
  );

  return Response.json({
    ok: true,
    invalidatedAt: isoTimestamp,
  });
}
