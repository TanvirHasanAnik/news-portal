import { z } from "zod";
import { hasScriptInjection } from "./baseSchema.js";
import { ASSIGNABLE_ROLE_IDS } from "../config/roles.js";

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।" })
    .max(40, { message: "ইউজারনেম সর্বোচ্চ ৪০ অক্ষরের হতে হবে।" })
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: "ইউজারনেমে কেবল ইংরেজি অক্ষর, সংখ্যা, আন্ডারস্কোর (_), ড্যাশ (-) বা ডট (.) ব্যবহার করা যাবে।",
    }),
  fullName: z
    .string()
    .trim()
    .max(100, { message: "নাম সর্বোচ্চ ১০০ অক্ষরের হতে হবে।" })
    .optional()
    .default(""),
  email: z
    .string()
    .trim()
    .email({ message: "সঠিক ইমেইল ঠিকানা প্রদান করুন।" })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(25, { message: "ফোন নম্বর সর্বোচ্চ ২৫ অক্ষরের হতে হবে।" })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .trim()
    .min(6, { message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" })
    .max(100, { message: "পাসওয়ার্ড সর্বোচ্চ ১০০ অক্ষরের মধ্যে হতে হবে।" })
    .refine((val) => !hasScriptInjection(val), {
      message: "পাসওয়ার্ডে অননুমোদিত কোড বা স্ক্রিপ্ট ব্যবহার করা যাবে না।",
    }),
  role: z.enum(ASSIGNABLE_ROLE_IDS, {
    errorMap: () => ({
      message: "একটি বৈধ পদবী নির্বাচন করুন।",
    }),
  }),
  bio: z.string().optional().default(""),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().trim().min(1, { message: "ব্যবহারকারী আইডি আবশ্যক।" }),
  role: z.enum(ASSIGNABLE_ROLE_IDS, {
    errorMap: () => ({
      message: "একটি বৈধ পদবী নির্বাচন করুন।",
    }),
  }),
});

export const toggleUserStatusSchema = z.object({
  userId: z.string().trim().min(1, { message: "ব্যবহারকারী আইডি আবশ্যক।" }),
  currentStatus: z.enum(["active", "disabled"], {
    errorMap: () => ({ message: "অবৈধ ব্যবহারকারী স্ট্যাটাস।" }),
  }),
});
