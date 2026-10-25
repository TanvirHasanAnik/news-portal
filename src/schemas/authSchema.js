import { z } from "zod";
import { hasScriptInjection } from "./baseSchema";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "ইউজারনেম দিন।" })
    .max(100, { message: "ইউজারনেম সর্বোচ্চ ১০০ অক্ষরের মধ্যে হতে হবে।" })
    .refine((val) => !hasScriptInjection(val), {
      message: "অননুমোদিত স্ক্রিপ্ট বা কোড ব্যবহার করা যাবে না।",
    }),
  password: z
    .string()
    .min(1, { message: "পাসওয়ার্ড দিন।" })
    .max(100, { message: "পাসওয়ার্ড সর্বোচ্চ ১০০ অক্ষরের মধ্যে হতে হবে।" })
    .refine((val) => !hasScriptInjection(val), {
      message: "পাসওয়ার্ডে অননুমোদিত কোড ব্যবহার করা যাবে না।",
    }),
});

export const updateProfileSchema = z.object({
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
  bio: z
    .string()
    .max(500, { message: "বিবরণ সর্বোচ্চ ৫০০ অক্ষরের হতে হবে।" })
    .optional()
    .default(""),
});

export const changeAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "বর্তমান পাসওয়ার্ড দিন।" }),
    newPassword: z.string().min(6, { message: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" }),
    confirmPassword: z.string().min(6, { message: "পাসওয়ার্ড নিশ্চিত করুন।" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।",
    path: ["confirmPassword"],
  });

export const adminResetStaffPasswordSchema = z.object({
  userId: z.string().trim().min(1, { message: "সদস্য আইডি আবশ্যক।" }),
  newPassword: z.string().min(6, { message: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" }),
});
