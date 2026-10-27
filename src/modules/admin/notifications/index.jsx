import React from "react";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
} from "@/repositories/notificationRepository";
import { NotificationHeader } from "./components/NotificationHeader";
import { NotificationManager } from "./components/NotificationManager";

export default async function NotificationsModule({ currentUser }) {
  let notifications = [];
  let unreadCount = 0;

  try {
    if (currentUser?.id) {
      const [notifs, unread] = await Promise.all([
        getUserNotifications(currentUser.id, { limit: 100 }),
        getUnreadNotificationCount(currentUser.id),
      ]);
      notifications = notifs || [];
      unreadCount = unread || 0;

      // Mark all notifications as read in the database so that badges clear on next visit/reload
      if (unreadCount > 0) {
        await markAllNotificationsAsRead(currentUser.id);
      }
    }
  } catch (err) {
    console.error("[NotificationsModule error]:", err);
  }

  return (
    <div className="space-y-6">
      <NotificationHeader unreadCount={unreadCount} />
      <NotificationManager
        initialNotifications={notifications}
        currentUser={currentUser}
      />
    </div>
  );
}
