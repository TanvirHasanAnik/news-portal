import { getR2Bucket } from "@/lib/r2";

/**
 * GET /api/images/[...key]
 * Streams image objects from Cloudflare R2 bucket (NEWS_IMAGES_BUCKET)
 */
export async function GET(request, { params }) {
  try {
    const { key } = await params;
    const imageKey = Array.isArray(key) ? key.join("/") : key;

    if (!imageKey) {
      return new Response("Image key required", { status: 400 });
    }

    const bucket = await getR2Bucket();
    const object = await bucket.get(imageKey);

    if (!object) {
      return new Response("Image not found", { status: 404 });
    }

    const headers = new Headers();
    if (typeof object.writeHttpMetadata === "function") {
      object.writeHttpMetadata(headers);
    } else if (object.httpMetadata?.contentType) {
      headers.set("content-type", object.httpMetadata.contentType);
    }

    if (object.httpEtag) {
      headers.set("etag", object.httpEtag);
    }

    headers.set("cache-control", "public, max-age=31536000, immutable");

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving R2 image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
