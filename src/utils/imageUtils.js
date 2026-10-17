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

/**
 * Extracts YouTube video ID from various YouTube URL formats or ID strings.
 *
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Raw 11-character VIDEO_ID
 *
 * @param {string|null|undefined} url - The YouTube link or ID
 * @returns {string|null} 11-char video ID or null
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Generates a YouTube video thumbnail URL from a YouTube URL or video ID.
 *
 * @param {string|null|undefined} url - YouTube URL or video ID
 * @param {string} [quality="hqdefault"] - Thumbnail quality ('hqdefault', 'mqdefault', 'maxresdefault')
 * @returns {string|null} Valid thumbnail image URL or null
 */
export function getYouTubeThumbnail(url, quality = "hqdefault") {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Generates a privacy-enhanced YouTube embed URL for iframe players.
 *
 * @param {string|null|undefined} url - YouTube URL or video ID
 * @returns {string|null} Embed URL or null
 */
export function getYouTubeEmbedUrl(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}

