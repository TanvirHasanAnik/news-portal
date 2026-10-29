import { z } from "zod";
import { safeString, safeEmail } from "./baseSchema.js";
import { ASSIGNABLE_ROLE_IDS } from "../config/roles.js";

export const createAdminRequestSchema = z.object({
  requestType: z.enum(
    ["new_user", "role_change", "disable_user", "curation_change", "change_role", "remove_user", "other"],
    {
      errorMap: () => ({ message: "আবেদনের ধরণ নির্বাচন করুন।" }),
    }
  ),
  targetUserId: z.string().trim().optional().nullable(),
  requestedName: safeString({
    label: "আবেদনকারীর নাম",
    min: 0,
    max: 60,
    required: false,
    allowEmpty: true,
  })
    .refine((val) => !val || /^[a-zA-Z\s.-]+$/.test(val), {
      message: "ব্যবহারকারীর পূর্ণ নাম শুধুমাত্র ইংরেজি অক্ষরে হতে হবে।",
    })
    .optional()
    .nullable(),
  requestedEmail: safeEmail({
    label: "ইমেইল",
    required: false,
  })
    .optional()
    .nullable(),
  requestedRole: z
    .enum(ASSIGNABLE_ROLE_IDS, {
      errorMap: () => ({
        message: "একটি বৈধ পদবী নির্বাচন করুন।",
      }),
    })
    .optional()
    .nullable(),
  note: safeString({
    label: "আবেদনের বিবরণ বা নোট",
    min: 2,
    max: 500,
    required: true,
  }),
});

export const updateAdminRequestStatusSchema = z.object({
  requestId: z.string().trim().min(1, { message: "অনুরোধ আইডি আবশ্যক।" }),
  newStatus: z.enum(["pending", "approved", "rejected"], {
    errorMap: () => ({ message: "অবৈধ আবেদন স্ট্যাটাস।" }),
  }),
  reviewerNote: safeString({
    label: "পর্যালোচনা মন্তব্য",
    min: 0,
    max: 300,
    required: false,
    allowEmpty: true,
  })
    .optional()
    .default(""),
});

export const reviewAdminRequestSchema = updateAdminRequestStatusSchema;
