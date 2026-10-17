import React from "react";
import { getYouTubeEmbedUrl } from "../utils/imageUtils";

/**
 * Reusable YouTubeEmbed Component
 * 
 * Renders a responsive 16:9 YouTube video player iframe with privacy-enhanced mode.
 */
export default function YouTubeEmbed({
  url,
  title = "ভিডিও প্রতিবেদন",
  className = "",
}) {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div
      role="region"
      aria-label="ইউটিউব ভিডিও প্লেয়ার"
      className={`relative aspect-video w-full overflow-hidden bg-black rounded-xs shadow-2xs ${className}`}
    >
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
}

