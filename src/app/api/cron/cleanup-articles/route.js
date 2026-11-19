import { cleanupExpiredOnlineDeskArticles } from "@/repositories/articleRepository";
import { invalidateHomepage } from "@/lib/cache/invalidate";

export const dynamic = "force-dynamic";

function isAuthorized(request) {
  const secretKey = (process.env.ADMIN_SECRET_KEY || process.env.CRON_SECRET || "").trim();
  if (!secretKey) return false;

  const headerSecret = (
    request.headers.get("x-secret-key") ||
    request.headers.get("X-Secret-Key") ||
    ""
  ).trim();
  if (headerSecret && headerSecret === secretKey) return true;

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (token && token === secretKey) return true;

  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get("secret") || searchParams.get("key");
  if (queryKey && queryKey === secretKey) return true;

  const cfCronHeader = request.headers.get("cf-cron-secret");
  if (cfCronHeader && cfCronHeader === secretKey) return true;

  return false;
}

export async function GET(request) {
  return handleCleanup(request);
}

export async function POST(request) {
  return handleCleanup(request);
}

async function handleCleanup(request) {
  if (!isAuthorized(request)) {
    return Response.json(
      { success: false, message: "Unauthorized request" },
      { status: 401 }
    );
  }

  try {
    const result = await cleanupExpiredOnlineDeskArticles({
      daysOld: 30,
      minRetentionCount: 10,
      batchSize: 50,
      operatorId: "system_cron",
      operatorUsername: "weekly_cron",
    });

    invalidateHomepage();

    return Response.json({
      success: true,
      deletedCount: result.deletedCount,
      imagesDeleted: result.imagesDeleted,
      executedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cron article cleanup failure:", err);
    return Response.json(
      { success: false, error: "Internal processing error" },
      { status: 500 }
    );
  }
}
