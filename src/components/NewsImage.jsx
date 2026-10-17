"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_NEWS_IMAGE, getNewsImageUrl } from "../utils/imageUtils";

/**
 * NewsImage Component
 *
 * Renders an article image with automatic fallback to a branded placeholder:
 * 1. If `src` is null, undefined, or empty, displays DEFAULT_NEWS_IMAGE immediately.
 * 2. If the image fails to load (network error, 404, broken URL), gracefully swaps to DEFAULT_NEWS_IMAGE.
 */
export default function NewsImage({
  src,
  alt = "সংবাদ চিত্র",
  className = "w-full h-full object-cover",
  fallbackSrc = DEFAULT_NEWS_IMAGE,
  loading = "lazy",
  decoding = "async",
  onError,
  ...props
}) {
  const initialSrc = getNewsImageUrl(src) || fallbackSrc;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  // Sync state if `src` prop changes dynamically
  useEffect(() => {
    const validSrc = getNewsImageUrl(src) || fallbackSrc;
    setImgSrc(validSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = (e) => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
    if (typeof onError === "function") {
      onError(e);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}

