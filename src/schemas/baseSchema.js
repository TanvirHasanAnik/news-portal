import { z } from "zod";






export function hasScriptInjection(text) {
  if (!text || typeof text !== "string") return false;


  if (/[<>]/.test(text)) return true;


  if (/javascript\s*:/i.test(text) || /data\s*:\s*text\/html/i.test(text) || /vbscript\s*:/i.test(text)) {
    return true;
  }


  if (/on\w+\s*=/i.test(text)) return true;


  if (/(?:eval|Function|setTimeout|setInterval|alert|prompt|confirm)\s*\(/i.test(text)) {
    return true;
  }


  if (/\b(?:console\.(?:log|warn|error))\s*\(/i.test(text)) return true;
  if (/<\?|<\/|%\>|<!--|-->|=>/i.test(text)) return true;

  return false;
}



export function hasMaliciousScripts(text) {
  if (!text || typeof text !== "string") return false;
  if (/<\s*script\b/i.test(text)) return true;
  if (/javascript\s*:/i.test(text)) return true;
  if (/on\w+\s*=/i.test(text)) return true;
  if (/(?:eval|Function|setTimeout|setInterval)\s*\(/i.test(text)) return true;
  if (/<\s*(?:iframe|object|embed|applet|meta|link|style)\b/i.test(text)) return true;
  return false;
}



export function formatZodError(error, defaultMessage = "অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।") {
  if (!error) return defaultMessage;
  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0];
    if (firstIssue && firstIssue.message) {
      return firstIssue.message;
    }
  }
  if (error.message && typeof error.message === "string") {

    if (error.message.includes("[") || error.message.includes("{") || error.message.includes("ZodError")) {
      return defaultMessage;
    }
    return error.message;
  }
  return defaultMessage;
}



export function safeString({
  label = "তথ্য",
  min = 1,
  max = 250,
  required = true,
  allowEmpty = false,
} = {}) {
  let schema = z.string().trim();

  if (required && !allowEmpty) {
    schema = schema.min(min, {
      message: `${label} আবশ্যক।`,
    });
  }

  if (max) {
    schema = schema.max(max, {
      message: `${label} সর্বোচ্চ ${max} অক্ষরের মধ্যে হতে হবে।`,
    });
  }

  return schema.refine((val) => !hasScriptInjection(val), {
    message: `${label}-এ কোনো ধরনের কোড, স্ক্রিপ্ট বা বিশেষ ট্যাগ ব্যবহার করা যাবে না।`,
  });
}



export function safeSlug({ label = "ইংরেজি স্লাগ", min = 2, max = 80, required = true } = {}) {
  let schema = z.string().trim().toLowerCase();

  if (required) {
    schema = schema.min(min, {
      message: `${label} আবশ্যক (কমপক্ষে ${min} অক্ষর)।`,
    });
  }

  if (max) {
    schema = schema.max(max, {
      message: `${label} সর্বোচ্চ ${max} অক্ষরের মধ্যে হতে হবে।`,
    });
  }

  return schema
    .refine((val) => !hasScriptInjection(val), {
      message: `${label}-এ কোনো কোড বা স্ক্রিপ্ট গ্রহণযোগ্য নয়।`,
    })
    .refine((val) => !val || /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(val), {
      message: `${label} শুধুমাত্র ছোট হাতের ইংরেজি অক্ষর (a-z), সংখ্যা (0-9) এবং হাইফেন (-) দিয়ে হতে হবে।`,
    });
}



export function safeInteger({
  label = "সংখ্যা",
  min = 0,
  max = 1000000,
  defaultValue = 0,
} = {}) {
  return z
    .union([z.number(), z.string(), z.undefined(), z.null()])
    .transform((val) => {
      if (val === undefined || val === null || val === "") return defaultValue;
      if (typeof val === "number") return Math.round(val);
      const parsed = parseInt(String(val).trim(), 10);
      return isNaN(parsed) ? defaultValue : parsed;
    })
    .refine((num) => num >= min, {
      message: `${label} অবশ্যই ${min} বা তার বেশি হতে হবে।`,
    })
    .refine((num) => num <= max, {
      message: `${label} সর্বোচ্চ ${max} হতে পারে।`,
    });
}



export function safeEmail({ label = "ইমেইল ঠিকানা", required = true } = {}) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  let schema = z.string().trim().toLowerCase();

  if (required) {
    schema = schema.min(1, { message: `${label} আবশ্যক।` });
  }

  return schema
    .refine((val) => !hasScriptInjection(val), {
      message: `${label}-এ কোনো কোড বা স্ক্রিপ্ট গ্রহণযোগ্য নয়।`,
    })
    .refine((val) => !val || (val.length <= 100 && emailRegex.test(val)), {
      message: "অনুগ্রহ করে একটি কার্যকর ইমেইল ঠিকানা লিখুন (যেমন: name@example.com)।",
    });
}



export function safeUrl({ label = "লিংক", required = false } = {}) {
  return z
    .string()
    .trim()
    .refine((val) => !hasScriptInjection(val), {
      message: `${label}-এ কোনো কোড বা স্ক্রিপ্ট গ্রহণযোগ্য নয়।`,
    })
    .refine(
      (val) => {
        if (!val) return !required;

        if (val.startsWith("/") || val === "#") return true;

        try {
          const parsed = new URL(val);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      {
        message: "অনুগ্রহ করে একটি সঠিক ওয়েব লিংক লিখুন (যেমন: https://... অথবা /article/...)।",
      }
    );
}

