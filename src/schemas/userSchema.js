import { z } from "zod";
import { safeString, safeEmail } from "./baseSchema.js";
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
  role: z.enum(validRoles, {
    errorMap: () => ({ message: "একটি বৈধ দায়িত্ব বা রোল নির্বাচন করুন।" }),
  }),
  bio: safeString({
    label: "সংক্ষিপ্ত পরিচিতি",
    min: 0,
    max: 300,
    required: false,
    allowEmpty: true,
  })
    .optional()
    .default(""),
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

