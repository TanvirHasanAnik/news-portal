"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/repositories/notificationRepository";

export async function markNotificationAsReadAction(notificationId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "অননুমোদিত অনুরোধ।" };
    }

    if (!notificationId) {
      return { success: false, message: "নোটিফিকেশন আইডি অনুপস্থিত।" };
    }

    await markNotificationAsRead(notificationId, currentUser.id);
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("markNotificationAsReadAction error:", error);
    return { success: false, message: "ত্রুটি দেখা দিয়েছে।" };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "অননুমোদিত অনুরোধ।" };
    }

    await markAllNotificationsAsRead(currentUser.id);
    revalidatePath("/admin");

    return { success: true, message: "সকল নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে।" };
  } catch (error) {
    console.error("markAllNotificationsAsReadAction error:", error);
    return { success: false, message: "ত্রুটি দেখা দিয়েছে।" };
  }
}

