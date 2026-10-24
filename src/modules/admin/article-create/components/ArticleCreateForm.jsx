"use client";

import React, { useTransition, useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { articleCreateSchema } from "@/schemas/articleSchema";
import { createArticleAction } from "@/actions/articleActions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import ArticleFormFeedback from "./ArticleFormFeedback";
import ArticleContentFields from "./ArticleContentFields";
import ArticleMediaFields from "./ArticleMediaFields";
import ArticlePublishSettings from "./ArticlePublishSettings";
import ArticleFormSubmit from "./ArticleFormSubmit";

export default function ArticleCreateForm({ categories = [] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const uncommittedImagesRef = useRef(new Set());

  const defaultCategorySlug = categories[2]?.slug || categories[0]?.slug || "national";

  // Initialize React Hook Form paired with centralized Zod Article Schema
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(articleCreateSchema),
    mode: "onChange",
    defaultValues: {
      headline: "",
      summary: "",
      content: "",
      categorySlug: defaultCategorySlug,
      subcategoryName: "",
      images: [],
      youtubeUrl: "",
      status: "published",
    },
  });

  // Watch values for dynamic dependent UI
  const categorySlug = watch("categorySlug") || defaultCategorySlug;
  const images = watch("images") || [];
  const youtubeUrl = watch("youtubeUrl") || "";

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

    setValue("images", newImages, { shouldValidate: true });
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

    reset({
      headline: "",
      summary: "",
      content: "",
      categorySlug: defaultCategorySlug,
      subcategoryName: "",
      images: [],
      youtubeUrl: "",
      status: "published",
    });
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

  const onValidSubmit = async (data, targetStatus = "published") => {
    setResult(null);

    const formData = new FormData();
    formData.append("headline", data.headline);
    formData.append("summary", data.summary || "");
    formData.append("content", data.content || "");
    formData.append("categorySlug", data.categorySlug);
    formData.append("subcategoryName", data.subcategoryName || "");
    formData.append("images", JSON.stringify(data.images?.slice(0, 3) || []));
    formData.append("image", data.images?.[0] || "");
    formData.append("youtubeUrl", data.youtubeUrl || "");
    formData.append("authorName", "নিজস্ব প্রতিবেদক");
    formData.append("location", "ঢাকা");
    formData.append("status", targetStatus);

    startTransition(async () => {
      const res = await createArticleAction(null, formData);
      setResult(res);
      if (res?.success) {
        // Article successfully saved in database — commit images so they are retained permanently
        uncommittedImagesRef.current.clear();
        reset({
          headline: "",
          summary: "",
          content: "",
          categorySlug: defaultCategorySlug,
          subcategoryName: "",
          images: [],
          youtubeUrl: "",
          status: "published",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const [confirmConfig, setConfirmConfig] = useState(null);

  const handleFormSubmit = handleSubmit((data) => {
    setConfirmConfig({
      message: "আপনি কি নিশ্চিতভাবে এই সংবাদটি প্রকাশ করতে চান?",
      onConfirm: () => {
        setConfirmConfig(null);
        onValidSubmit(data, "published");
      },
    });
  });

  const handleSaveDraft = handleSubmit((data) => {
    setConfirmConfig({
      message: "আপনি কি নিশ্চিতভাবে এই সংবাদটি খসড়া হিসেবে সংরক্ষণ করতে চান?",
      onConfirm: () => {
        setConfirmConfig(null);
        onValidSubmit(data, "draft");
      },
    });
  });

  const requestReset = () => {
    setConfirmConfig({
      message: "আপনি কি নিশ্চিত যে ফর্মের সকল তথ্য মুছে ফেলে রিসেট করতে চান?",
      confirmVariant: "destructive",
      onConfirm: () => {
        setConfirmConfig(null);
        handleReset();
      },
    });
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Success / Error Notification Alert */}
        <ArticleFormFeedback result={result} onReset={requestReset} />

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 spans): Primary Content & Media */}
          <div className="lg:col-span-2 space-y-6">
            <ArticleContentFields
              register={register}
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />

            <ArticleMediaFields
              register={register}
              errors={errors}
              images={images}
              setImages={handleImagesChange}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={(val) => setValue("youtubeUrl", val, { shouldValidate: true })}
            />
          </div>

          {/* Right Column (1 span): Category & Publishing Controls */}
          <div className="space-y-6">
            <ArticlePublishSettings
              register={register}
              errors={errors}
              categorySlug={categorySlug}
              subcategoryName={watch("subcategoryName") || ""}
              setCategorySlug={(slug) => setValue("categorySlug", slug, { shouldValidate: true })}
              setSubcategoryName={(sub) => setValue("subcategoryName", sub, { shouldValidate: true })}
              categories={categories}
              availableSubcategories={availableSubcategories}
            />

            <ArticleFormSubmit
              isPending={isPending}
              onSaveDraft={handleSaveDraft}
              onReset={requestReset}
            />
          </div>
        </div>
      </form>

      {/* Re-confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmConfig)}
        onClose={() => setConfirmConfig(null)}
        onConfirm={confirmConfig?.onConfirm}
        message={confirmConfig?.message}
        confirmVariant={confirmConfig?.confirmVariant || "default"}
      />
    </>
  );
}
