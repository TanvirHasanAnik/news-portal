import { z } from "zod";
import { safeString, safeSlug, safeInteger, hasScriptInjection } from "./baseSchema.js";
import { BANGLA_EDITORIAL_REGEX, hasEnglishLetters } from "./articleSchema.js";

/**
 * Reusable helper for Bangla-only category/subcategory names
 */
export const safeBanglaCategoryName = ({ label = "ক্যাটাগরির নাম", min = 2, max = 60 } = {}) =>
  z
    .string()
    .trim()
    .min(min, { message: `${label} আবশ্যক (কমপক্ষে ${min} অক্ষর)।` })
    .max(max, { message: `${label} সর্বোচ্চ ${max} অক্ষরের মধ্যে হতে হবে।` })
    .refine((val) => !hasScriptInjection(val), {
      message: `${label}-এ কোনো কোড বা স্ক্রিপ্ট গ্রহণযোগ্য নয়।`,
    })
    .refine((val) => !hasEnglishLetters(val) && BANGLA_EDITORIAL_REGEX.test(val), {
      message: `${label} শুধুমাত্র বাংলা বর্ণমালায় হতে হবে (ইংরেজি অক্ষর গ্রহণযোগ্য নয়)।`,
    });

export const categorySchema = z.object({
  name: safeBanglaCategoryName({
    label: "ক্যাটাগরির নাম",
    min: 2,
    max: 60,
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
  }).optional(),
});

export const subcategorySchema = z.object({
  categoryId: z.string().trim().optional(),
  name: safeBanglaCategoryName({
    label: "উপ-বিভাগের নাম",
    min: 2,
    max: 60,
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
  }).optional(),
});

export const categoryBatchItemSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().trim().min(1, { message: "ক্যাটাগরির নাম আবশ্যক।" }),
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
        name: z.string().trim().min(1, { message: "উপ-বিভাগের নাম আবশ্যক।" }),
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

