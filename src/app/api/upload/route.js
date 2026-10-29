import { NextResponse } from "next/server";
import {
  getR2Bucket,
  getPublicImageUrl,
  deleteMultipleFromR2,
  extractKeyFromImageUrl,
} from "@/lib/r2";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; 



export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const url = new URL(request.url);


    if (contentType.includes("application/json") || url.searchParams.get("action") === "cleanup") {
      let body = {};
      try {
        body = await request.json();
      } catch {
        const text = await request.text();
        if (text) {
          try {
            body = JSON.parse(text);
          } catch {}
        }
      }

      const itemsToDelete = body.urls || body.keys || (body.url ? [body.url] : (body.key ? [body.key] : []));
      if (Array.isArray(itemsToDelete) && itemsToDelete.length > 0) {
        const count = await deleteMultipleFromR2(itemsToDelete);
        return NextResponse.json({ success: true, count, message: "Uncommitted images cleaned up." });
      }

      return NextResponse.json({ success: true, count: 0 });
    }


    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "কোনো ফাইল পাওয়া যায়নি।" },
        { status: 400 }
      );
    }


    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "শুধুমাত্র ছবি (JPEG, PNG, WebP, AVIF, GIF) আপলোড করা যাবে।",
        },
        { status: 400 }
      );
    }


    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "ছবির আকার ১০ মেগাবাইটের (10MB) কম হতে হবে।",
        },
        { status: 400 }
      );
    }


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
      message: "ছবিটি সফলভাবে আপলোড হয়েছে!",
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



export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const queryKey = url.searchParams.get("key");
    const queryUrl = url.searchParams.get("url");

    let targets = [];

    if (queryKey) targets.push(queryKey);
    if (queryUrl) targets.push(queryUrl);


    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const body = await request.json();
        if (body.key) targets.push(body.key);
        if (body.url) targets.push(body.url);
        if (Array.isArray(body.keys)) targets.push(...body.keys);
        if (Array.isArray(body.urls)) targets.push(...body.urls);
      } catch {}
    }

    if (targets.length === 0) {
      return NextResponse.json(
        { success: false, error: "মুছে ফেলার জন্য কোনো ইমেজ কি (key) বা ইউআরএল (url) প্রদান করা হয়নি।" },
        { status: 400 }
      );
    }

    const count = await deleteMultipleFromR2(targets);

    return NextResponse.json({
      success: true,
      count,
      message: `${count}টি ছবি ক্লাউডফ্লেয়ার R2 বাকেট থেকে সফলভাবে মুছে ফেলা হয়েছে।`,
    });
  } catch (error) {
    console.error("R2 Delete Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `ছবি মুছে ফেলতে সমস্যা হয়েছে: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
