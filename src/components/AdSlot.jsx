"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const AD_PRESETS = {
  leaderboard: {
    adKey: "d319c02e77b13fe903152e5faf3f8fcd",
    src: "https://bauval.org/22/d319c02e77b13fe903152e5faf3f8fcd",
    width: 728,
    height: 90,
    wrapperClass: "w-full max-w-[728px] h-[90px]",
  },
  mobileBanner: {
    adKey: "111e9f9103131d1893ff5f7d2bf12057",
    src: "https://bauval.org/22/111e9f9103131d1893ff5f7d2bf12057",
    width: 320,
    height: 50,
    wrapperClass: "w-full max-w-[320px] h-[50px]",
  },
  mediumRectangle: {
    adKey: "0dd0cfa748279959f3b94a51a434a0a4",
    src: "https://bauval.org/22/0dd0cfa748279959f3b94a51a434a0a4",
    width: 300,
    height: 250,
    wrapperClass: "w-full max-w-[320px] aspect-[300/250] min-h-[250px]",
  },
  skyscraper: {
    adKey: "f0ef0cef6f26a3a3fc1815c4a19526d3",
    src: "https://bauval.org/22/f0ef0cef6f26a3a3fc1815c4a19526d3",
    width: 160,
    height: 600,
    wrapperClass: "w-full max-w-[320px] min-h-[600px]",
  },
};

function buildAdSrcDoc({ adKey, src, width, height }) {
  const safeKey = JSON.stringify(String(adKey));
  const safeSrc = JSON.stringify(String(src));
  const safeWidth = Number(width);
  const safeHeight = Number(height);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
</head>
<body>
<script type="text/javascript">
atOptions = {
  'key' : ${safeKey},
  'format' : 'iframe',
  'height' : ${safeHeight},
  'width' : ${safeWidth},
  'params' : {}
};
</script>
<script type="text/javascript" src=${safeSrc}></script>
</body>
</html>`;
}

export default function AdSlot({
  variant,
  adKey,
  src,
  width,
  height,
  slotId = "default",
  mediaQuery = "",
  eager = false,
  className = "",
  containerClassName = "",
}) {
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);
  const [matchesMedia, setMatchesMedia] = useState(!mediaQuery);
  const [status, setStatus] = useState("loading");

  const preset = variant ? AD_PRESETS[variant] : null;
  const resolvedKey = adKey || preset?.adKey || "";
  const resolvedSrc = src || preset?.src || "";
  const resolvedWidth = Number(width || preset?.width || 0);
  const resolvedHeight = Number(height || preset?.height || 0);
  const defaultWrapperClass = preset?.wrapperClass || "w-full flex items-center justify-center";

  const isValidConfig =
    Boolean(resolvedKey) &&
    Boolean(resolvedSrc) &&
    Number.isFinite(resolvedWidth) &&
    resolvedWidth > 0 &&
    Number.isFinite(resolvedHeight) &&
    resolvedHeight > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mediaQuery) {
      setMatchesMedia(true);
      return;
    }

    try {
      const mq = window.matchMedia(mediaQuery);
      const handleChange = () => setMatchesMedia(mq.matches);
      handleChange();
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", handleChange);
        return () => mq.removeEventListener("change", handleChange);
      }
      mq.addListener(handleChange);
      return () => mq.removeListener(handleChange);
    } catch {
      setMatchesMedia(true);
    }
  }, [mediaQuery]);

  useEffect(() => {
    if (mounted && matchesMedia) {
      setStatus("loading");
    }
  }, [pathname, resolvedKey, resolvedWidth, resolvedHeight, mounted, matchesMedia]);

  const shouldRenderIframe = mounted && matchesMedia && isValidConfig && status !== "error";

  const srcDoc = shouldRenderIframe
    ? buildAdSrcDoc({
        adKey: resolvedKey,
        src: resolvedSrc,
        width: resolvedWidth,
        height: resolvedHeight,
      })
    : "";

  return (
    <div
      role="complementary"
      aria-label="বিজ্ঞাপন"
      className={`relative bg-slate-100/70 flex items-center justify-center overflow-hidden mx-auto ${
        containerClassName || defaultWrapperClass
      } ${className}`}
    >
      {(!shouldRenderIframe || status === "loading") && (
        <span
          aria-hidden="true"
          className="text-[11px] font-medium text-slate-400 select-none pointer-events-none"
        >
          বিজ্ঞাপন
        </span>
      )}

      {shouldRenderIframe && (
        <iframe
          key={`${pathname}-${resolvedKey}-${slotId}-${resolvedWidth}x${resolvedHeight}`}
          srcDoc={srcDoc}
          width={resolvedWidth}
          height={resolvedHeight}
          loading={eager ? "eager" : "lazy"}
          scrolling="no"
          title="বিজ্ঞাপন"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          style={{
            width: `${resolvedWidth}px`,
            height: `${resolvedHeight}px`,
            maxWidth: "100%",
          }}
          className={`border-0 overflow-hidden bg-transparent ${
            status === "loaded" ? "opacity-100" : "opacity-0 absolute inset-0 m-auto"
          } transition-opacity duration-150`}
        />
      )}
    </div>
  );
}
