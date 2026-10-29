import { z } from "zod";
import { safeString, safeUrl, safeInteger, hasScriptInjection } from "./baseSchema.js";
import { BANGLA_EDITORIAL_REGEX, countWords, hasEnglishLetters } from "./articleSchema.js";

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

export const handpickedFormSchema = z.object({
  articleId: z.string().trim().min(1, { message: "অনুগ্রহ করে একটি প্রকাশিত সংবাদ নির্বাচন করুন।" }),
});

export const breakingFormSchema = z
  .object({
    articleId: z.string().optional().default(""),
    customTitle: z.string().trim().optional().default(""),
  })
  .superRefine((data, ctx) => {
    const artId = (data.articleId || "").trim();
    const title = (data.customTitle || "").trim();


    if (!artId && !title) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "অনুগ্রহ করে একটি প্রকাশিত সংবাদ নির্বাচন করুন অথবা জরুরি শিরোনাম লিখুন।",
        path: ["articleId"],
      });
      return;
    }


    if (title) {
      if (hasScriptInjection(title)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "শিরোনামে কোনো প্রকার কোড, স্ক্রিপ্ট বা বিশেষ চিহ্ন (< >) গ্রহণযোগ্য নয়।",
          path: ["customTitle"],
        });
        return;
      }

      if (hasEnglishLetters(title) || !BANGLA_EDITORIAL_REGEX.test(title)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "শিরোনামে শুধুমাত্র বাংলা বর্ণমালা গ্রহণযোগ্য।",
          path: ["customTitle"],
        });
        return;
      }

      const words = countWords(title);
      if (words < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "শিরোনামটি অত্যন্ত সংক্ষিপ্ত। অন্তত ৩টি শব্দের অর্থপূর্ণ শিরোনাম লিখুন।",
          path: ["customTitle"],
        });
        return;
      }

      if (words > 18) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "শিরোনামটি অত্যন্ত দীর্ঘ (সর্বোচ্চ ১৮ শব্দ)। পত্রিকার লেআউট সুরক্ষায় ১৮ শব্দের মধ্যে সীমাবদ্ধ রাখুন।",
          path: ["customTitle"],
        });
        return;
      }
    }
  });
