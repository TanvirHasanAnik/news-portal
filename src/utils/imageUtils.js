

export const DEFAULT_NEWS_IMAGE = "/news-placeholder.svg";

export function getNewsImageUrl(url) {
  if (!url || typeof url !== "string" || !url.trim()) {
    return DEFAULT_NEWS_IMAGE;
  }
  return url.trim();
}

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

export function getYouTubeThumbnail(url, quality = "hqdefault") {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function getYouTubeEmbedUrl(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}

