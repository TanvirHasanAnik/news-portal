"use client";

import { useEffect, useRef } from "react";

export default function ArticleViewTracker({ articleId }) {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !articleId) return;

    if (navigator.webdriver) return;

    const botRegex = /bot|googlebot|crawler|spider|robot|crawling|lighthouse/i;
    if (botRegex.test(navigator.userAgent)) return;

    const currentPath = window.location.pathname;
    if (!currentPath.startsWith("/article/")) return;

    const storageKey = `art_pv_${articleId}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {}

    const triggerView = () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;

      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {}

      const payload = JSON.stringify({
        articleId,
        path: window.location.pathname,
      });

      try {
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          const blob = new Blob([payload], { type: "application/json" });
          const sent = navigator.sendBeacon("/api/articles/view", blob);
          if (!sent) {
            fetch("/api/articles/view", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: payload,
              keepalive: true,
            }).catch(() => {});
          }
        } else {
          fetch("/api/articles/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        fetch("/api/articles/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    const scheduleAfterRender = () => {
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            triggerView();
          });
        });
      } else {
        setTimeout(triggerView, 150);
      }
    };

    let cleanup = null;

    if (document.visibilityState === "hidden") {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          scheduleAfterRender();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      cleanup = () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    } else if (document.readyState === "complete") {
      scheduleAfterRender();
    } else {
      const handleLoad = () => {
        window.removeEventListener("load", handleLoad);
        scheduleAfterRender();
      };
      window.addEventListener("load", handleLoad);
      cleanup = () => {
        window.removeEventListener("load", handleLoad);
      };
    }

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [articleId]);

  return null;
}
