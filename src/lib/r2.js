import { getCloudflareContext } from "@opennextjs/cloudflare";

let localR2Instance = null;

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
      const sanitizedKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, "").replace(/^\/+/, "");
      const filePath = path.join(storageDir, sanitizedKey);
      const resolvedPath = path.resolve(filePath);
      const resolvedStorageDir = path.resolve(storageDir);

      if (!resolvedPath.startsWith(resolvedStorageDir)) {
        throw new Error("Invalid file path");
      }

      const fileDir = path.dirname(resolvedPath);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      let buffer;
      if (Buffer.isBuffer(streamOrBuffer)) {
        buffer = streamOrBuffer;
      } else if (streamOrBuffer instanceof ArrayBuffer) {
        buffer = Buffer.from(streamOrBuffer);
      } else if (typeof streamOrBuffer?.getReader === "function") {
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

      fs.writeFileSync(resolvedPath, buffer);

      const metaPath = `${resolvedPath}.meta.json`;
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
      const sanitizedKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, "").replace(/^\/+/, "");
      const filePath = path.join(storageDir, sanitizedKey);
      const resolvedPath = path.resolve(filePath);
      const resolvedStorageDir = path.resolve(storageDir);

      if (!resolvedPath.startsWith(resolvedStorageDir) || !fs.existsSync(resolvedPath)) {
        return null;
      }

      const fileBuffer = fs.readFileSync(resolvedPath);
      const metaPath = `${resolvedPath}.meta.json`;
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
      if (Array.isArray(key)) {
        for (const k of key) {
          await this.delete(k);
        }
        return;
      }
      const sanitizedKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, "").replace(/^\/+/, "");
      const filePath = path.join(storageDir, sanitizedKey);
      const resolvedPath = path.resolve(filePath);
      const resolvedStorageDir = path.resolve(storageDir);

      if (!resolvedPath.startsWith(resolvedStorageDir)) {
        return;
      }

      if (fs.existsSync(resolvedPath)) {
        fs.unlinkSync(resolvedPath);
      }
      const metaPath = `${resolvedPath}.meta.json`;
      if (fs.existsSync(metaPath)) {
        fs.unlinkSync(metaPath);
      }
    },
  };

  return localR2Instance;
}

export async function getR2Bucket() {
  try {
    const cfContext = await getCloudflareContext({ async: true });
    if (cfContext?.env?.NEWS_IMAGES_BUCKET) {
      return cfContext.env.NEWS_IMAGES_BUCKET;
    }
  } catch (_e) {}

  return await createLocalR2Adapter();
}

export function getPublicImageUrl(key, env) {
  const publicBase =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    env?.R2_PUBLIC_URL ||
    null;

  if (publicBase) {
    return `${publicBase.replace(/\/$/, "")}/${key.replace(/^\/+/, "")}`;
  }

  return `/api/images/${key.replace(/^\/+/, "")}`;
}

export function extractKeyFromImageUrl(urlOrKey) {
  if (!urlOrKey || typeof urlOrKey !== "string") return null;

  if (urlOrKey.includes("/api/images/")) {
    const after = urlOrKey.split("/api/images/")[1];
    try {
      return decodeURIComponent(after.replace(/^\/+/, ""));
    } catch {
      return after.replace(/^\/+/, "");
    }
  }

  if (urlOrKey.startsWith("http://") || urlOrKey.startsWith("https://")) {
    const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (publicBase && urlOrKey.startsWith(publicBase)) {
      return urlOrKey.replace(publicBase, "").replace(/^\/+/, "");
    }
    return null;
  }

  return urlOrKey.replace(/^\/+/, "");
}

export async function deleteFromR2(keyOrUrl) {
  if (!keyOrUrl) return false;
  const key = extractKeyFromImageUrl(keyOrUrl);
  if (!key) return false;

  try {
    const bucket = await getR2Bucket();
    await bucket.delete(key);
    return true;
  } catch (err) {
    console.error("R2 delete error:", err);
    return false;
  }
}

export async function deleteMultipleFromR2(keysOrUrls) {
  if (!Array.isArray(keysOrUrls) || keysOrUrls.length === 0) return 0;
  const keys = keysOrUrls.map(extractKeyFromImageUrl).filter(Boolean);
  if (keys.length === 0) return 0;

  try {
    const bucket = await getR2Bucket();
    await bucket.delete(keys);
    return keys.length;
  } catch (err) {
    console.error("R2 deleteMultiple error:", err);
    return 0;
  }
}
