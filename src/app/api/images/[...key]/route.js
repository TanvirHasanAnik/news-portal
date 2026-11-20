import { getR2Bucket } from "@/lib/r2";



export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const rawKey = resolvedParams?.key || resolvedParams?.path;
    const imageKey = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;

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

    if (!headers.get("content-type")) {
      const lowerKey = imageKey.toLowerCase();
      if (lowerKey.endsWith(".webp")) {
        headers.set("content-type", "image/webp");
      } else if (lowerKey.endsWith(".png")) {
        headers.set("content-type", "image/png");
      } else if (lowerKey.endsWith(".jpg") || lowerKey.endsWith(".jpeg")) {
        headers.set("content-type", "image/jpeg");
      } else if (lowerKey.endsWith(".svg")) {
        headers.set("content-type", "image/svg+xml");
      } else {
        headers.set("content-type", "image/jpeg");
      }
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
