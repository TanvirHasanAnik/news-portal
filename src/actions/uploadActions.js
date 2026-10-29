"use server";

import { getCurrentUser } from "@/lib/auth/server";
import { getR2Bucket, getPublicImageUrl, deleteMultipleFromR2, deleteFromR2 } from "@/lib/r2";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadImageAction(formData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.status !== "active") {
      return { success: false, error: "অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।" };
    }

    const file = formData.get("file");

    if (!file || typeof file === "string" || typeof file.stream !== "function") {
      return { success: false, error: "কোনো ফাইল পাওয়া যায়নি।" };
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return {
        success: false,
        error: "শুধুমাত্র ছবি (JPEG, PNG, WebP, AVIF, GIF) আপলোড করা যাবে।",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "ছবির আকার ১০ মেগাবাইটের (10MB) কম হতে হবে।",
      };
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
        uploadedBy: currentUser.username,
        uploadedAt: now.toISOString(),
      },
    });

    const publicUrl = getPublicImageUrl(key);

    return {
      success: true,
      url: publicUrl,
      key,
      filename: file.name,
      size: file.size,
      contentType: file.type,
      message: "ছবিটি সফলভাবে আপলোড হয়েছে!",
    };
  } catch (error) {
    console.error("uploadImageAction error:", error);
    return {
      success: false,
      error: `আপলোডে সমস্যা হয়েছে: ${error.message}`,
    };
  }
}

export async function deleteImageAction(keyOrUrl) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.status !== "active") {
      return { success: false, error: "অননুমোদিত অনুরোধ।" };
    }

    const success = await deleteFromR2(keyOrUrl);
    return { success };
  } catch (error) {
    console.error("deleteImageAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteImagesAction(keysOrUrls) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.status !== "active") {
      return { success: false, error: "অননুমোদিত অনুরোধ।" };
    }

    const count = await deleteMultipleFromR2(keysOrUrls);
    return { success: true, count };
  } catch (error) {
    console.error("deleteImagesAction error:", error);
    return { success: false, error: error.message };
  }
}
