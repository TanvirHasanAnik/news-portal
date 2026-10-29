import { z } from "zod";
import { hasScriptInjection, hasMaliciousScripts, formatZodError } from "./baseSchema.js";

export const BANGLA_EDITORIAL_REGEX =
  /^[\u0980-\u09FF\u0964\u09650-9\s।,?!:;'"\u2018\u2019\u201C\u201D«»()[\]{}\-–—/%\$৳.,#@&*]*$/u;

export const YOUTUBE_REGEX =
  /^(https?:\/\/)?((www|m)\.)?(youtube\.com\/(watch\?(.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})($|[?&#/].*)$/;

export function countWords(text) {
  if (!text || typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function hasEnglishLetters(text) {
  if (!text || typeof text !== "string") return false;
  return /[a-zA-Z]/.test(text);
}

export function hasDisallowedCode(text) {
  return hasScriptInjection(text);
}

export function hasMaliciousContent(text) {
  return hasMaliciousScripts(text);
}

export function extractPlainText(content) {
  if (!content || typeof content !== "string") return "";
  const trimmed = content.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed?.blocks && Array.isArray(parsed.blocks)) {
        return parsed.blocks
          .map((b) => b.text || (b.items ? b.items.map((i) => i.text).join(" ") : ""))
          .join(" ")
          .trim();
      }
    } catch {}
  }

  return trimmed.replace(/<[^>]*>?/gm, "").trim();
}

export const articleCreateSchema = z.object({

  headline: z
    .string()
    .trim()
    .min(1, "সংবাদের শিরোনাম আবশ্যক।")
    .refine((val) => !hasDisallowedCode(val), {
      message: "শিরোনামে কোনো প্রকার কোড, স্ক্রিপ্ট বা বিশেষ চিহ্ন (< >) গ্রহণযোগ্য নয়।",
    })
    .refine((val) => countWords(val) >= 3, {
      message: "শিরোনামটি অত্যন্ত সংক্ষিপ্ত। অন্তত ৩টি শব্দের অর্থপূর্ণ শিরোনাম লিখুন।",
    })
    .refine((val) => countWords(val) <= 18, {
      message: "শিরোনামটি অত্যন্ত দীর্ঘ (সর্বোচ্চ ১৮ শব্দ)। পত্রিকার লেআউট সুরক্ষায় ১৮ শব্দের মধ্যে সীমাবদ্ধ রাখুন।",
    }),

  summary: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((val) => !val || !hasDisallowedCode(val), {
      message: "সারাংশে কোনো প্রকার কোড, স্ক্রিপ্ট বা বিশেষ চিহ্ন (< >) গ্রহণযোগ্য নয়।",
    })
    .refine((val) => !val || countWords(val) >= 5, {
      message: "সারাংশ প্রদান করলে তা ন্যূনতম ৫টি শব্দের হতে হবে।",
    })
    .refine((val) => !val || countWords(val) <= 50, {
      message: "সারাংশ সর্বোচ্চ ৫০টি শব্দের মধ্যে সীমাবদ্ধ রাখুন (কার্ড লেআউট অক্ষুণ্ণ রাখতে)।",
    }),

  content: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((val) => !val || !hasMaliciousContent(val), {
      message: "বিস্তারিত সংবাদে কোনো প্রকার স্ক্রিপ্ট বা ক্ষতিকর কোড গ্রহণযোগ্য নয়।",
    })
    .refine(
      (val) => {
        if (!val) return true;
        const plain = extractPlainText(val);
        if (!plain) return true;
        return countWords(plain) >= 10;
      },
      {
        message: "বিস্তারিত সংবাদ প্রদান করলে ন্যূনতম ১০টি শব্দ হতে হবে।",
      }
    )
    .refine(
      (val) => {
        if (!val) return true;
        const plain = extractPlainText(val);
        if (!plain) return true;
        return countWords(plain) <= 4000;
      },
      {
        message: "বিস্তারিত সংবাদ সর্বোচ্চ ৪,০০০ শব্দের মধ্যে হতে হবে।",
      }
    ),

  subcategoryName: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((val) => !val || !hasDisallowedCode(val), {
      message: "উপ-বিভাগে কোনো প্রকার কোড বা বিশেষ চিহ্ন গ্রহণযোগ্য নয়।",
    })
    .refine((val) => !val || (!hasEnglishLetters(val) && BANGLA_EDITORIAL_REGEX.test(val)), {
      message: "উপ-বিভাগে শুধুমাত্র বাংলা ভাষা গ্রহণযোগ্য (ইংরেজি অনুমোদিত নয়)।",
    })
    .refine((val) => !val || countWords(val) <= 4, {
      message: "উপ-বিভাগের নাম সর্বোচ্চ ৪টি শব্দের মধ্যে হতে হবে।",
    }),

  categorySlug: z
    .string()
    .trim()
    .min(1, "অনুগ্রহ করে একটি বিভাগ নির্বাচন করুন।")
    .refine((val) => val !== "latest" && val !== "handpicked", {
      message: "স্থায়ী ক্যাটাগরি ('সর্বশেষ' বা 'বাছাইকৃত') কোনো আর্টিকেলের মূল বিষয় ক্যাটাগরি হতে পারে না।",
    }),

  youtubeUrl: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((val) => !val || !hasDisallowedCode(val), {
      message: "ইউটিউব লিংকে কোনো প্রকার কোড বা স্ক্রিপ্ট গ্রহণযোগ্য নয়।",
    })
    .refine((val) => !val || YOUTUBE_REGEX.test(val), {
      message: "অনুগ্রহ করে একটি সঠিক ও কার্যকর ইউটিউব ভিডিও লিঙ্ক দিন (যেমন: https://www.youtube.com/watch?v=... অথবা https://youtu.be/...)।",
    }),

  images: z.array(z.string()).max(3, "সর্বোচ্চ ৩টি ছবি যোগ করা যাবে।").optional().default([]),
  status: z
    .enum(["draft", "pending", "published", "rejected", "archived"])
    .optional()
    .default("published"),
  rejectionReason: z.string().trim().max(1000).optional().nullable().default(""),
  isBreaking: z.boolean().optional().default(false),
  isLead: z.boolean().optional().default(false),
  isHandpicked: z.boolean().optional().default(false),
});
