import { NextResponse } from "next/server";
import { recordArticleView } from "@/repositories/analyticsRepository";
import { findArticleBySlugOrId } from "@/repositories/articleRepository";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
    const referer = request.headers.get("referer") || "";

    const botPatterns = [
      "bot",
      "crawler",
      "spider",
      "googlebot",
      "bingbot",
      "slurp",
      "baiduspider",
      "yandex",
      "duckduckbot",
      "headlesschrome",
      "phantomjs",
      "curl",
      "wget",
      "python",
      "postman",
      "lighthouse",
    ];

    if (botPatterns.some((pattern) => userAgent.includes(pattern))) {
      return NextResponse.json({ success: false }, { status: 200 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const { articleId, path } = body || {};
    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    let cleanPath = String(path || "").trim();
    try {
      cleanPath = decodeURIComponent(cleanPath);
    } catch {}

    if (!cleanPath.startsWith("/article/")) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (!refererUrl.pathname.startsWith("/article/")) {
          return NextResponse.json({ success: false }, { status: 403 });
        }
      } catch {}
    }

    let ipHash = null;
    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip");

    if (clientIp) {
      try {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clientIp));
        ipHash = Array.from(new Uint8Array(digest))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .slice(0, 64);
      } catch {}
    }

    const article = await findArticleBySlugOrId(articleId);
    if (!article || article.status !== "published") {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const updated = await recordArticleView(article.id, {
      categorySlug: article.category_slug || article.categorySlug,
      subcategoryName: article.subcategory_name || article.subcategory,
      path: cleanPath,
      referrer: referer ? referer.slice(0, 1000) : null,
      userAgent: userAgent ? userAgent.slice(0, 500) : null,
      ipHash,
    });

    return NextResponse.json({ success: Boolean(updated) });
  } catch (err) {
    console.error("API /api/articles/view error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
