import { z } from "zod";
import { safeString, safeUrl, safeInteger } from "./baseSchema.js";

export const curatedItemSchema = z
  .object({
    id: z.string().optional().nullable(),
    type: z.enum(["handpicked", "breaking"], {
      errorMap: () => ({ message: "কিউরেশন ধরন নির্বাচন করুন।" }),
    }),
    article_id: z.string().trim().optional().nullable(),
    articleId: z.string().trim().optional().nullable(),
    custom_title: safeString({
      label: "বিকল্প শিরোনাম",
      min: 0,
      max: 180,
      required: false,
      allowEmpty: true,
    })
      .optional()
      .nullable(),
    customTitle: safeString({
      label: "বিকল্প শিরোনাম",
      min: 0,
      max: 180,
      required: false,
      allowEmpty: true,
    })
      .optional()
      .nullable(),
    custom_url: safeUrl({
      label: "কাস্টম লিংক",
      required: false,
    })
      .optional()
      .nullable(),
    customUrl: safeUrl({
      label: "কাস্টম লিংক",
      required: false,
    })
      .optional()
      .nullable(),
    priority: safeInteger({
      label: "অগ্রাধিকার",
      min: 0,
      max: 100000,
      defaultValue: 0,
    }).optional(),
    is_active: z.union([z.number(), z.boolean()]).optional().default(1),
  })
  .refine(
    (data) => {
      const artId = data.article_id || data.articleId;
      const title = (data.custom_title || data.customTitle || "").trim();
      return Boolean(artId || title);
    },
    {
      message: "অনুগ্রহ করে একটি প্রকাশিত সংবাদ নির্বাচন করুন অথবা শিরোনাম লিখুন।",
    }
  );

export const curatedBatchSchema = z.array(
  z.object({
    id: z.string().optional().nullable(),
    type: z.enum(["handpicked", "breaking"]),
    article_id: z.string().trim().optional().nullable(),
    custom_title: safeString({
      label: "বিকল্প শিরোনাম",
      min: 0,
      max: 180,
      required: false,
      allowEmpty: true,
    })
      .optional()
      .nullable(),
    custom_url: safeUrl({
      label: "কাস্টম লিংক",
      required: false,
    })
      .optional()
      .nullable(),
    priority: safeInteger({
      label: "অগ্রাধিকার",
      min: 0,
      max: 100000,
      defaultValue: 0,
    }).optional(),
    is_active: z.union([z.number(), z.boolean()]).optional().default(1),
  })
);

export const handpickedFormSchema = z
  .object({
    articleId: z.string().optional().default(""),
    customTitle: safeString({
      label: "বিকল্প শিরোনাম",
      min: 0,
      max: 180,
      required: false,
      allowEmpty: true,
    })
      .optional()
      .default(""),
  })
  .refine(
    (data) => Boolean((data.articleId && data.articleId.trim()) || (data.customTitle && data.customTitle.trim())),
    {
      message: "একটি প্রকাশিত সংবাদ নির্বাচন করুন অথবা শিরোনাম লিখুন।",
      path: ["customTitle"],
    }
  );

export const breakingFormSchema = z
  .object({
    articleId: z.string().optional().default(""),
    customTitle: safeString({
      label: "জরুরি শিরোনাম",
      min: 0,
      max: 180,
      required: false,
      allowEmpty: true,
    })
      .optional()
      .default(""),
  })
  .refine(
    (data) => Boolean((data.articleId && data.articleId.trim()) || (data.customTitle && data.customTitle.trim())),
    {
      message: "একটি প্রকাশিত সংবাদ নির্বাচন করুন অথবা জরুরি শিরোনাম লিখুন।",
      path: ["customTitle"],
    }
  );

