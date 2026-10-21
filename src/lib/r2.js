import { getCloudflareContext } from "@opennextjs/cloudflare";

let localR2Instance = null;

/**
 * Creates an in-process filesystem adapter mimicking Cloudflare R2 bucket.
 * Used when running locally in Next.js development (next dev) without Miniflare.
 * In production or wrangler preview, getCloudflareContext().env.NEWS_IMAGES_BUCKET is used.
 */
async function createLocalR2Adapter() {
  if (localR2Instance) return localR2Instance;

  if (typeof process === "undefined" || !process.versions?.node) {
    throw new Error(
      "Cloudflare R2 bucket binding 'NEWS_IMAGES_BUCKET' was not found in environment context. " +
      "Ensure [[r2_buckets]] binding = 'NEWS_IMAGES_BUCKET' is configured in wrangler.toml."
    );
  }

  const fs = await import("node:fs");
  const path = await import("node:path");

  const storageDir = path.join(process.cwd(), ".data", "r2_news_images");
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  localR2Instance = {
    isLocal: true,
    async put(key, streamOrBuffer, options = {}) {
      const sanitizedKey = key.replace(/^\/+/, "");
      const filePath = path.join(storageDir, sanitizedKey);
      const fileDir = path.dirname(filePath);

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      let buffer;
      if (Buffer.isBuffer(streamOrBuffer)) {
        buffer = streamOrBuffer;
      } else if (streamOrBuffer instanceof ArrayBuffer) {
        buffer = Buffer.from(streamOrBuffer);
      } else if (typeof streamOrBuffer?.getReader === "function") {
        // ReadableStream
        const reader = streamOrBuffer.getReader();
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        buffer = Buffer.concat(chunks);
      } else if (typeof streamOrBuffer?.arrayBuffer === "function") {
        const ab = await streamOrBuffer.arrayBuffer();
        buffer = Buffer.from(ab);
      } else {
        buffer = Buffer.from(streamOrBuffer || "");
      }

      fs.writeFileSync(filePath, buffer);

      // Store metadata sidecar for local dev
      const metaPath = `${filePath}.meta.json`;
      const meta = {
        httpMetadata: options.httpMetadata || { contentType: "application/octet-stream" },
        customMetadata: options.customMetadata || {},
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
      };
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

      return {
        key: sanitizedKey,
        size: buffer.length,
        etag: `w/"local-${Date.now()}"`,
        httpMetadata: meta.httpMetadata,
        customMetadata: meta.customMetadata,
      };
    },

    async get(key) {
      const sanitizedKey = key.replace(/^\/+/, "");
      const filePath = path.join(storageDir, sanitizedKey);

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const fileBuffer = fs.readFileSync(filePath);
      const metaPath = `${filePath}.meta.json`;
      let meta = { httpMetadata: { contentType: "application/octet-stream" } };
      if (fs.existsSync(metaPath)) {
        try {
          meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        } catch {}
      }

      return {
        key: sanitizedKey,
        size: fileBuffer.length,
        httpEtag: `w/"local-${fileBuffer.length}"`,
        httpMetadata: meta.httpMetadata || {},
        customMetadata: meta.customMetadata || {},
        body: fileBuffer,
        writeHttpMetadata(headers) {
          if (meta.httpMetadata?.contentType) {
            headers.set("content-type", meta.httpMetadata.contentType);
          }
          if (meta.httpMetadata?.cacheControl) {
            headers.set("cache-control", meta.httpMetadata.cacheControl);
          }
        },
        async arrayBuffer() {
          return fileBuffer.buffer;
        },
      };
    },

    async delete(key) {
      const sanitizedKey = key.replace(/^\/+/, "");
      const filePath = path.join(storageDir, sanitizedKey);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      const metaPath = `${filePath}.meta.json`;
      if (fs.existsSync(metaPath)) {
        fs.unlinkSync(metaPath);
      }
    },
  };

  return localR2Instance;
}

/**
 * Returns the Cloudflare R2 bucket binding 'NEWS_IMAGES_BUCKET'
 * Falls back to local dev filesystem storage when running outside Cloudflare runtime.
 */
export async function getR2Bucket() {
  try {
    const cfContext = await getCloudflareContext({ async: true });
    if (cfContext?.env?.NEWS_IMAGES_BUCKET) {
      return cfContext.env.NEWS_IMAGES_BUCKET;
    }
  } catch (_e) {
    // Cloudflare context is not active; fallback to local dev adapter
  }

  return await createLocalR2Adapter();
}

/**
 * Returns the public URL for an uploaded R2 image key
 */
export function getPublicImageUrl(key, env) {
  const publicBase =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    env?.R2_PUBLIC_URL ||
    null;

  if (publicBase) {
    return `${publicBase.replace(/\/$/, "")}/${key.replace(/^\/+/, "")}`;
  }

  // Self-hosted streaming route via Next.js
  return `/api/images/${key.replace(/^\/+/, "")}`;
}
