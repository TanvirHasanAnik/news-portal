import { z } from "zod";
import { hasScriptInjection, hasMaliciousScripts, formatZodError } from "./baseSchema.js";

/**
 * Standard Bangladesh Newsportal Editorial & Layout Rules:
 * - Headline (শিরোনাম): Mandatory, 3 - 18 words (prevents breaking card grid heights in Bengali typography). Pure Bangla only.
 * - Summary / Lead (সারাংশ): Optional, 5 - 50 words if provided (standard 2-sentence lead for news cards). English and Bangla allowed.
 * - Content / Body (মূল বিবরণ): Optional, 10 - 4,000 words if provided. English and Bangla allowed.
 * - Subcategory (উপ-বিভাগ): Optional, max 4 words if provided.
 * - YouTube Video Link: Optional, but if provided MUST be a genuine and valid YouTube video URL.
 * - Category (বিভাগ): Mandatory.
 *
 * Security & Sanitization Rules:
 * - All inputs are automatically trimmed before validation.
 * - Strictly no scripts, code, HTML tags, or angle brackets (< >) allowed in text fields.
 * - Strictly no JavaScript injections (javascript:, eval, on*, <script>).
 * - Headline strictly requires Bengali Unicode characters, digits (০-৯ & 0-9), and standard Bengali editorial punctuation.
 */

// Bengali character and standard editorial punctuation regex for Bangla-only fields (Headline)
export const BANGLA_EDITORIAL_REGEX =
  /^[\u0980-\u09FF\u0964\u09650-9\s।,?!:;'"\u2018\u2019\u201C\u201D«»()[\]{}\-–—/%\$৳.,#@&*]*$/u;

// Strict YouTube URL regex supporting watch, youtu.be, embed, shorts, and mobile URLs with 11-char video ID
export const YOUTUBE_REGEX =
  /^(https?:\/\/)?((www|m)\.)?(youtube\.com\/(watch\?(.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})($|[?&#/].*)$/;

/**
 * Counts words in a string by splitting on whitespace
 */
export function countWords(text) {
  if (!text || typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Checks if the string contains any English alphabet letters (A-Z, a-z)
 */
export function hasEnglishLetters(text) {
  if (!text || typeof text !== "string") return false;
  return /[a-zA-Z]/.test(text);
}

/**
 * Detects HTML tags, angle brackets, script tags, and code injection attempts
 */
export function hasDisallowedCode(text) {
  return hasScriptInjection(text);
}

/**
 * Detects malicious scripts inside rich HTML or JSON content
 */
export function hasMaliciousContent(text) {
  return hasMaliciousScripts(text);
}

/**
 * Extracts plain text from either a RichTextEditor JSON string or raw HTML
 */
export function extractPlainText(content) {
  if (!content || typeof content !== "string") return "";
  const trimmed = content.trim();
  if (!trimmed) return "";

  // If JSON format from RichTextEditor ({ version: 1, blocks: [...] })
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

  // Strip HTML tags for plain text inspection
  return trimmed.replace(/<[^>]*>?/gm, "").trim();
}

/**
 * Zod Schema for Article Creation Input Fields
 */
export const articleCreateSchema = z.object({
  // 1. Headline - Mandatory, 3 - 18 words, Strictly Pure Bangla, No scripts
  headline: z
    .string()
    .trim()
    .min(1, "সংবাদের শিরোনাম আবশ্যক।")
    .refine((val) => !hasDisallowedCode(val), {
      message: "শিরোনামে কোনো প্রকার কোড, স্ক্রিপ্ট বা বিশেষ চিহ্ন (< >) গ্রহণযোগ্য নয়।",
    })
    .refine((val) => !hasEnglishLetters(val) && BANGLA_EDITORIAL_REGEX.test(val), {
      message: "শিরোনামে শুধুমাত্র বাংলা বর্ণমালা গ্রহণযোগ্য।",
    })
    .refine((val) => countWords(val) >= 3, {
      message: "শিরোনামটি অত্যন্ত সংক্ষিপ্ত। অন্তত ৩টি শব্দের অর্থপূর্ণ শিরোনাম লিখুন।",
    })
    .refine((val) => countWords(val) <= 18, {
      message: "শিরোনামটি অত্যন্ত দীর্ঘ (সর্বোচ্চ ১৮ শব্দ)। পত্রিকার লেআউট সুরক্ষায় ১৮ শব্দের মধ্যে সীমাবদ্ধ রাখুন।",
    }),

  // 2. Summary - Optional, 5 - 50 words if provided, English & Bangla allowed, No scripts
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

  // 3. Content - Optional, 10 - 4,000 words if provided, English & Bangla allowed, No scripts
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

  // 4. Subcategory - Optional, max 4 words if provided, No scripts
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

  // 5. Category - Mandatory selection (Must be dynamic content category, not permanent)
  categorySlug: z
    .string()
    .trim()
    .min(1, "অনুগ্রহ করে একটি বিভাগ নির্বাচন করুন।")
    .refine((val) => val !== "latest" && val !== "handpicked", {
      message: "স্থায়ী ক্যাটাগরি ('সর্বশেষ' বা 'বাছাইকৃত') কোনো আর্টিকেলের মূল বিষয় ক্যাটাগরি হতে পারে না।",
    }),

  // 6. YouTube Video URL - Optional, but if provided must be a valid YouTube video link
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

  // 7. Media & Metadata
  images: z.array(z.string()).max(3, "সর্বোচ্চ ৩টি ছবি যোগ করা যাবে।").optional().default([]),
  status: z.enum(["published", "draft"]).optional().default("published"),
  isBreaking: z.boolean().optional().default(false),
  isLead: z.boolean().optional().default(false),
  isHandpicked: z.boolean().optional().default(false),
});
