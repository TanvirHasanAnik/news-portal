import { z } from "zod";
import { safeEmail, hasScriptInjection } from "./baseSchema";

export const loginSchema = z.object({
  email: safeEmail({
    label: "ইমেইল ঠিকানা",
    required: true,
  }),
  password: z
    .string()
    .min(1, { message: "পাসওয়ার্ড প্রদান করুন।" })
    .max(100, { message: "পাসওয়ার্ড সর্বোচ্চ ১০০ অক্ষরের মধ্যে হতে হবে।" })
    .refine((val) => !hasScriptInjection(val), {
      message: "পাসওয়ার্ডে অননুমোদিত কোড বা স্ক্রিপ্ট ব্যবহার করা যাবে না।",
    }),
});

