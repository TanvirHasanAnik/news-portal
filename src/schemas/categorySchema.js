import { z } from "zod";
import { safeString, safeSlug, safeInteger } from "./baseSchema.js";

export const categorySchema = z.object({
  name: safeString({
    label: "ক্যাটাগরির নাম",
    min: 2,
    max: 60,
    required: true,
  }),
  slug: safeSlug({
    label: "ক্যাটাগরির স্লাগ",
    min: 2,
    max: 60,
    required: true,
  }),
  sortOrder: safeInteger({
    label: "সাজানোর ক্রম",
    min: 0,
    max: 10000,
    defaultValue: 10,
  }),
});

export const subcategorySchema = z.object({
  categoryId: z.string().trim().min(1, { message: "মূল ক্যাটাগরি নির্বাচন করুন।" }),
  name: safeString({
    label: "উপ-বিভাগের নাম",
    min: 2,
    max: 60,
    required: true,
  }),
  slug: safeSlug({
    label: "উপ-বিভাগের স্লাগ",
    min: 2,
    max: 60,
    required: true,
  }),
  sortOrder: safeInteger({
    label: "সাজানোর ক্রম",
    min: 0,
    max: 10000,
    defaultValue: 10,
  }),
});

export const categoryBatchItemSchema = z.object({
  id: z.string().optional().nullable(),
  name: safeString({
    label: "ক্যাটাগরির নাম",
    min: 2,
    max: 60,
    required: true,
  }),
  slug: safeSlug({
    label: "ক্যাটাগরির স্লাগ",
    min: 2,
    max: 60,
    required: true,
  }),
  sort_order: safeInteger({
    label: "সাজানোর ক্রম",
    min: 0,
    max: 10000,
    defaultValue: 10,
  }).optional(),
  is_permanent: z.union([z.number(), z.boolean()]).optional(),
  subcategories: z
    .array(
      z.object({
        id: z.string().optional().nullable(),
        name: safeString({
          label: "উপ-বিভাগের নাম",
          min: 2,
          max: 60,
          required: true,
        }),
        slug: safeSlug({
          label: "উপ-বিভাগের স্লাগ",
          min: 2,
          max: 60,
          required: true,
        }),
        sort_order: safeInteger({
          label: "সাজানোর ক্রম",
          min: 0,
          max: 10000,
          defaultValue: 10,
        }).optional(),
      })
    )
    .optional()
    .default([]),
});

export const categoryBatchSchema = z.array(categoryBatchItemSchema);

