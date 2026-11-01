import { z } from "zod";
import { hasScriptInjection } from "./baseSchema.js";

function isValidHttpUrl(val) {
  if (!val || typeof val !== "string") return true;
  const trimmed = val.trim();
  if (trimmed === "") return true;
  try {
    const url = new URL(trimmed);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

const safeSocialUrl = (label, example) =>
  z
    .string()
    .trim()
    .max(500, { message: `${label} সর্বোচ্চ ৫০০ অক্ষরের মধ্যে হতে হবে।` })
    .refine((val) => !hasScriptInjection(val), {
      message: `${label}-এ কোনো অননুমোদিত কোড বা স্ক্রিপ্ট দেওয়া যাবে না।`,
    })
    .refine(isValidHttpUrl, {
      message: `${label}-এর জন্য একটি সঠিক ও কার্যকর ওয়েব ঠিকানা লিখুন (যেমন: ${example})। যেকোনো সাধারণ টেক্সট বা ভুল লিংক গ্রহণযোগ্য নয়।`,
    })
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : ""));

export const socialLinksSchema = z.object({
  facebook: safeSocialUrl("ফেসবুক লিংক", "https://facebook.com/yourpage"),
  youtube: safeSocialUrl("ইউটিউব লিংক", "https://youtube.com/@yourchannel"),
  twitter: safeSocialUrl("টুইটার / এক্স লিংক", "https://x.com/yourhandle"),
  instagram: safeSocialUrl("ইনস্টাগ্রাম লিংক", "https://instagram.com/yourhandle"),
});

