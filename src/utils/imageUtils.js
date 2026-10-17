/**
 * Default fallback placeholder image for articles without an image
 */
export const DEFAULT_NEWS_IMAGE = "/news-placeholder.svg";

/**
 * Returns a valid image URL for an article, falling back to DEFAULT_NEWS_IMAGE
 * if the provided URL is null, undefined, empty, or whitespace.
 *
 * @param {string|null|undefined} url - The news article image URL
 * @returns {string} Valid image URL or default placeholder
 */
export function getNewsImageUrl(url) {
  if (!url || typeof url !== "string" || !url.trim()) {
    return DEFAULT_NEWS_IMAGE;
  }
  return url.trim();
}

/**
 * Optimizes Unsplash image URLs with appropriate width and quality.
 * If the URL is missing or invalid, returns DEFAULT_NEWS_IMAGE.
 *
 * @param {string|null|undefined} url - Raw image URL
 * @param {number} [width=400] - Desired image width
 * @param {number} [quality=75] - Compression quality (1-100)
 * @returns {string} Optimized URL or placeholder
 */
export function getOptimizedNewsImage(url, width = 400, quality = 75) {
  const safeUrl = getNewsImageUrl(url);
  if (safeUrl === DEFAULT_NEWS_IMAGE) {
    return DEFAULT_NEWS_IMAGE;
  }

  if (!safeUrl.includes("images.unsplash.com")) {
    return safeUrl;
  }

  try {
    const parsed = new URL(safeUrl);
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.set("q", String(quality));
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "crop");
    return parsed.toString();
  } catch {
    return safeUrl;
  }
}

