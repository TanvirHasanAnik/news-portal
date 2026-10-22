import { z } from "zod";
import { safeString, safeEmail, hasScriptInjection } from "./baseSchema.js";
import { USER_ROLES } from "../lib/auth/index.js";

const validRoles = Object.values(USER_ROLES);

export const createUserSchema = z.object({
  name: safeString({
    label: "ব্যবহারকারীর নাম",
    min: 2,
    max: 60,
    required: true,
  }),
  email: safeEmail({
    label: "ইমেইল ঠিকানা",
    required: true,
  }),
  password: z
    .string()
    .trim()
    .min(6, { message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" })
    .max(100, { message: "পাসওয়ার্ড সর্বোচ্চ ১০০ অক্ষরের মধ্যে হতে হবে।" })
    .refine((val) => !hasScriptInjection(val), {
      message: "পাসওয়ার্ডে অননুমোদিত কোড বা স্ক্রিপ্ট ব্যবহার করা যাবে না।",
    }),
  role: z.enum(validRoles, {
    errorMap: () => ({ message: "একটি বৈধ দায়িত্ব বা রোল নির্বাচন করুন।" }),
  }),
  bio: z.string().optional().default(""),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().trim().min(1, { message: "ব্যবহারকারী আইডি আবশ্যক।" }),
  role: z.enum(validRoles, {
    errorMap: () => ({ message: "একটি বৈধ দায়িত্ব বা রোল নির্বাচন করুন।" }),
  }),
});

export const toggleUserStatusSchema = z.object({
  userId: z.string().trim().min(1, { message: "ব্যবহারকারী আইডি আবশ্যক।" }),
  currentStatus: z.enum(["active", "disabled"], {
    errorMap: () => ({ message: "অবৈধ ব্যবহারকারী স্ট্যাটাস।" }),
  }),
});

