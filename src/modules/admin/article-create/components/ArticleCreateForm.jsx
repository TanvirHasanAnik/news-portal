"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { createArticleAction } from "@/actions/articleActions";
import ArticleFormFeedback from "./ArticleFormFeedback";
import ArticleContentFields from "./ArticleContentFields";
import ArticleMediaFields from "./ArticleMediaFields";
import ArticlePublishSettings from "./ArticlePublishSettings";
import ArticleFormSubmit from "./ArticleFormSubmit";

export default function ArticleCreateForm({ categories = [] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const uncommittedImagesRef = useRef(new Set());

  // Form State
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[2]?.slug || "national");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [images, setImages] = useState([]); // Up to 3 images
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [authorName] = useState("নিজস্ব প্রতিবেদক");
  const [location] = useState("ঢাকা");
  const [status] = useState("published");

  // Selected Category's subcategories
  const selectedCategory = categories.find((c) => c.slug === categorySlug);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Update images and immediately delete any removed ones from Cloudflare R2
  const handleImagesChange = (newImages) => {
    // Track newly added images
    newImages.forEach((img) => uncommittedImagesRef.current.add(img));

    // Delete any removed images from R2
    images.forEach((img) => {
      if (!newImages.includes(img)) {
        uncommittedImagesRef.current.delete(img);
        fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: img }),
        }).catch((e) => console.error("Error deleting image from R2:", e));
      }
    });

    setImages(newImages);
  };

  // Reset form and purge all uncommitted images from Cloudflare R2
  const handleReset = () => {
    const toDelete = Array.from(uncommittedImagesRef.current);
    if (toDelete.length > 0) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: toDelete }),
      }).catch((e) => console.error("Error purging images on reset:", e));
      uncommittedImagesRef.current.clear();
    }

    setHeadline("");
    setSummary("");
    setContent("");
    setImages([]);
    setYoutubeUrl("");
    setResult(null);
  };

  // Clean up uncommitted images from R2 if user navigates away or closes tab without submitting/drafting
  useEffect(() => {
    const handleBeforeUnload = () => {
      const pending = Array.from(uncommittedImagesRef.current);
      if (pending.length > 0) {
        const payload = JSON.stringify({ urls: pending });
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/upload?action=cleanup", blob);
        } else {
          fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // SPA navigation unmount cleanup
      const pending = Array.from(uncommittedImagesRef.current);
      if (pending.length > 0) {
        fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: pending }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, []);

  const handleSave = (targetStatus = "published") => {
    setResult(null);

    const formData = new FormData();
    formData.append("headline", headline);
    formData.append("summary", summary);
    formData.append("content", content);
    formData.append("categorySlug", categorySlug);
    formData.append("subcategoryName", subcategoryName);
    formData.append("images", JSON.stringify(images.slice(0, 3)));
    formData.append("image", images[0] || "");
    formData.append("youtubeUrl", youtubeUrl);
    formData.append("authorName", authorName);
    formData.append("location", location);
    formData.append("status", targetStatus);

    startTransition(async () => {
      const res = await createArticleAction(null, formData);
      setResult(res);
      if (res?.success) {
        // Article successfully saved in database — commit images so they are retained permanently
        uncommittedImagesRef.current.clear();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave("published");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success / Error Notification Alert */}
      <ArticleFormFeedback result={result} onReset={handleReset} />

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Primary Content & Media */}
        <div className="lg:col-span-2 space-y-6">
          <ArticleContentFields
            headline={headline}
            setHeadline={setHeadline}
            summary={summary}
            setSummary={setSummary}
            content={content}
            setContent={setContent}
          />

          <ArticleMediaFields
            images={images}
            setImages={handleImagesChange}
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
          />
        </div>

        {/* Right Column (1 span): Category & Publishing Controls */}
        <div className="space-y-6">
          <ArticlePublishSettings
            categorySlug={categorySlug}
            setCategorySlug={setCategorySlug}
            subcategoryName={subcategoryName}
            setSubcategoryName={setSubcategoryName}
            categories={categories}
            availableSubcategories={availableSubcategories}
          />

          <ArticleFormSubmit
            isPending={isPending}
            onSaveDraft={() => handleSave("draft")}
            onReset={handleReset}
          />
        </div>
      </div>
    </form>
  );
}

