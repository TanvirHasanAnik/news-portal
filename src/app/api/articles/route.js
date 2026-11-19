import { NextResponse } from "next/server";
import { getPublishedArticles, toPublicArticleSummary } from "@/repositories/articleRepository";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug") || searchParams.get("category") || undefined;
    const subcategoryName = searchParams.get("subcategoryName") || searchParams.get("sub") || searchParams.get("subcategory") || undefined;
    const rawLimit = searchParams.get("limit");
    const rawOffset = searchParams.get("offset");

    const limit = rawLimit ? Math.min(Math.max(1, parseInt(rawLimit, 10) || 20), 100) : 20;
    const offset = rawOffset ? Math.max(0, parseInt(rawOffset, 10) || 0) : 0;

    const rows = await getPublishedArticles({
      categorySlug,
      subcategoryName,
      limit,
      offset,
    });

    const articles = (rows || []).map(toPublicArticleSummary);

    return NextResponse.json(articles, { status: 200 });
  } catch (error) {
    console.error("API /api/articles error:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}
