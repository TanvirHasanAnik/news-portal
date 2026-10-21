"use client";

import React, { useState, useTransition } from "react";
import { createArticleAction } from "@/actions/articleActions";
import ArticleFormFeedback from "./ArticleFormFeedback";
import ArticleContentFields from "./ArticleContentFields";
import ArticleMediaFields from "./ArticleMediaFields";
import ArticlePublishSettings from "./ArticlePublishSettings";
import ArticleFormSubmit from "./ArticleFormSubmit";

export default function ArticleCreateForm({ categories = [] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);

  // Form State
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[2]?.slug || "national");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [authorName, setAuthorName] = useState("নিজস্ব প্রতিবেদক");
  const [location, setLocation] = useState("ঢাকা");
  const [status, setStatus] = useState("published");

  // Selected Category's subcategories
  const selectedCategory = categories.find((c) => c.slug === categorySlug);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Reset form
  const handleReset = () => {
    setHeadline("");
    setSummary("");
    setContent("");
    setImageUrl("");
    setImageCaption("");
    setYoutubeUrl("");
    setResult(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setResult(null);

    const formData = new FormData();
    formData.append("headline", headline);
    formData.append("summary", summary);
    formData.append("content", content);
    formData.append("categorySlug", categorySlug);
    formData.append("subcategoryName", subcategoryName);
    formData.append("image", imageUrl);
    formData.append("imageCaption", imageCaption);
    formData.append("youtubeUrl", youtubeUrl);
    formData.append("authorName", authorName);
    formData.append("location", location);
    formData.append("status", status);

    startTransition(async () => {
      const res = await createArticleAction(null, formData);
      setResult(res);
      if (res?.success) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
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
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            imageCaption={imageCaption}
            setImageCaption={setImageCaption}
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
            status={status}
            onReset={handleReset}
          />
        </div>
      </div>
    </form>
  );
}

