"use client";

import React, { useTransition, useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { articleCreateSchema } from "@/schemas/articleSchema";
import { createArticleAction, updateArticleAction } from "@/actions/articleActions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import ArticleFormFeedback from "./ArticleFormFeedback";
import ArticleContentFields from "./ArticleContentFields";
import ArticleMediaFields from "./ArticleMediaFields";
import ArticlePublishSettings from "./ArticlePublishSettings";
import ArticleFormSubmit from "./ArticleFormSubmit";
import { isLowerRole as checkIsLowerRole } from "@/config/roles";
import { usePermissions } from "@/contexts/AuthContext";

export default function ArticleCreateForm({
  categories = [],
  initialArticle = null,
  currentUser = null,
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const uncommittedImagesRef = useRef(new Set());

  const isEditing = Boolean(initialArticle);
  const isLower = checkIsLowerRole(currentUser?.role);

  const defaultCategorySlug =
    initialArticle?.categorySlug ||
    categories[2]?.slug ||
    categories[0]?.slug ||
    "national";

  // Normalize initial images
  const initialImages = Array.isArray(initialArticle?.images)
    ? initialArticle.images
    : initialArticle?.image
    ? [initialArticle.image]
    : [];

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
      headline: initialArticle?.headline || "",
      summary: initialArticle?.summary || "",
      content: initialArticle?.content || "",
      categorySlug: defaultCategorySlug,
      subcategoryName: initialArticle?.subcategory || "",
      images: initialImages,
      youtubeUrl: initialArticle?.youtubeUrl || "",
      status: initialArticle?.status || (isLower ? "pending" : "published"),
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
    newImages.forEach((img) => uncommittedImagesRef.current.add(img));

    images.forEach((img) => {
      if (!newImages.includes(img) && !initialImages.includes(img)) {
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

  // Reset form
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
      headline: initialArticle?.headline || "",
      summary: initialArticle?.summary || "",
      content: initialArticle?.content || "",
      categorySlug: defaultCategorySlug,
      subcategoryName: initialArticle?.subcategory || "",
      images: initialImages,
      youtubeUrl: initialArticle?.youtubeUrl || "",
      status: initialArticle?.status || (isLower ? "pending" : "published"),
    });
    setResult(null);
  };

  // Cleanup uncommitted images on navigation
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

  const onValidSubmit = async (data, targetStatus, passToUpper = false) => {
    setResult(null);

    const resolvedStatus =
      targetStatus ||
      (isEditing
        ? initialArticle?.status || (isLower ? "pending" : "published")
        : isLower
        ? "pending"
        : "published");

    const formData = new FormData();
    if (isEditing) {
      formData.append("articleId", initialArticle.dbId || initialArticle.id);
    }
    formData.append("headline", data.headline);
    formData.append("summary", data.summary || "");
    formData.append("content", data.content || "");
    formData.append("categorySlug", data.categorySlug);
    formData.append("subcategoryName", data.subcategoryName || "");
    formData.append("images", JSON.stringify(data.images?.slice(0, 3) || []));
    formData.append("image", data.images?.[0] || "");
    formData.append("youtubeUrl", data.youtubeUrl || "");
    formData.append("location", "ঢাকা");
    formData.append("status", resolvedStatus);
    formData.append("passToUpper", passToUpper ? "true" : "false");

    startTransition(async () => {
      const actionFn = isEditing ? updateArticleAction : createArticleAction;
      const res = await actionFn(null, formData);
      setResult(res);

      if (res?.success) {
        uncommittedImagesRef.current.clear();
        if (!isEditing) {
          reset({
            headline: "",
            summary: "",
            content: "",
            categorySlug: defaultCategorySlug,
            subcategoryName: "",
            images: [],
            youtubeUrl: "",
            status: isLower ? "pending" : "published",
          });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const [confirmConfig, setConfirmConfig] = useState(null);
  const isSubEditorReview =
    currentUser?.role === "sub_editor" &&
    isEditing &&
    initialArticle?.created_by !== currentUser?.username;

  const handleFormSubmit = handleSubmit((data) => {
    if (isEditing) {
      if (isSubEditorReview) {
        handlePassSubEditorEdit();
        return;
      }
      setConfirmConfig({
        message: "আপনি কি নিশ্চিতভাবে এই সংবাদের পরিবর্তনগুলো আপডেট করতে চান?",
        onConfirm: () => {
          setConfirmConfig(null);
          onValidSubmit(data, initialArticle?.status);
        },
      });
    } else if (isLower) {
      setConfirmConfig({
        message: "আপনি কি নিশ্চিতভাবে এই সংবাদটি পর্যালোচনার জন্য জমা দিতে চান?",
        onConfirm: () => {
          setConfirmConfig(null);
          onValidSubmit(data, "pending");
        },
      });
    } else {
      setConfirmConfig({
        message: "আপনি কি নিশ্চিতভাবে এই সংবাদটি প্রকাশ করতে চান?",
        onConfirm: () => {
          setConfirmConfig(null);
          onValidSubmit(data, "published");
        },
      });
    }
  });

  const handleSaveSubEditorEdit = handleSubmit((data) => {
    setConfirmConfig({
      message: "আপনি কি সম্পাদিত তথ্যগুলো সংরক্ষণ করে প্রতিবেদকদের তালিকায় রাখতে চান?",
      onConfirm: () => {
        setConfirmConfig(null);
        onValidSubmit(data, "pending", false);
      },
    });
  });

  const handlePassSubEditorEdit = handleSubmit((data) => {
    setConfirmConfig({
      message: "আপনি কি নিশ্চিতভাবে এই সংবাদটি বর্তমান সম্পাদিত আকারে ঊর্ধ্বতন কর্তৃপক্ষের অনুমোদনের জন্য পাঠাতে চান?",
      onConfirm: () => {
        setConfirmConfig(null);
        onValidSubmit(data, "pending", true);
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

  const handleReject = handleSubmit((data) => {
    setConfirmConfig({
      message: "আপনি কি নিশ্চিতভাবে এই সংবাদটি প্রত্যাখ্যান করতে চান? এটি প্রতিবেদকের কাছে প্রত্যাখ্যাত হিসেবে চিহ্নিত থাকবে।",
      confirmVariant: "destructive",
      onConfirm: () => {
        setConfirmConfig(null);
        onValidSubmit(data, "rejected");
      },
    });
  });

  const requestReset = () => {
    setConfirmConfig({
      message: "আপনি কি নিশ্চিত যে ফর্মের পরিবর্তনগুলো রিসেট করতে চান?",
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
              isEditing={isEditing}
              isLowerRole={isLower}
              isSubEditorReview={isSubEditorReview}
              currentStatus={initialArticle?.status || "draft"}
              onSaveSubEditorEdit={isSubEditorReview ? handleSaveSubEditorEdit : null}
              onPassToUpper={isSubEditorReview ? handlePassSubEditorEdit : null}
              onSaveDraft={!isEditing ? handleSaveDraft : null}
              onReject={!isLower && isEditing ? handleReject : null}
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