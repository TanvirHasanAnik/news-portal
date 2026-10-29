"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_NEWS_IMAGE, getNewsImageUrl } from "../utils/imageUtils";

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

