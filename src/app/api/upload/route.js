import { NextResponse } from "next/server";
import { getR2Bucket, getPublicImageUrl } from "@/lib/r2";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/upload
 * Uploads an image to Cloudflare R2 bucket (NEWS_IMAGES_BUCKET) using bucket.put()
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "কোনো ফাইল পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    // MIME type validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "শুধুমাত্র ছবি (JPEG, PNG, WebP, AVIF, GIF) আপলোড করা যাবে।",
        },
        { status: 400 }
      );
    }

    // Size limit check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "ছবির আকার ১০ মেগাবাইটের (10MB) কম হতে হবে।",
        },
        { status: 400 }
      );
    }

    // Generate sanitized unique key: articles/YYYY-MM/timestamp-hash.ext
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const cleanOriginalName = (file.name || "image")
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const key = `articles/${yearMonth}/${Date.now()}-${randomSuffix}-${cleanOriginalName}`;

    const bucket = await getR2Bucket();

    // Save to Cloudflare R2 using bucket.put()
    await bucket.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "image/jpeg",
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: {
        originalName: file.name || "image",
        uploadedAt: now.toISOString(),
      },
    });

    const publicUrl = getPublicImageUrl(key);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
      filename: file.name,
      size: file.size,
      contentType: file.type,
      message: "ছবিটি সফলভাবে ক্লাউডফ্লেয়ার R2 বাকেটে আপলোড হয়েছে!",
    });
  } catch (error) {
    console.error("R2 Upload Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `আপলোডে ত্রুটি দেখা দিয়েছে: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
