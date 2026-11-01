import React from "react";
import {
  getUserNotifications,
  getUserNotificationsCount,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
} from "@/repositories/notificationRepository";
import { NotificationHeader } from "./components/NotificationHeader";
import { NotificationManager } from "./components/NotificationManager";

export default async function NotificationsModule({ currentUser, searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const page = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
  const filter = resolvedParams?.filter || "all";
  const search = resolvedParams?.q || "";
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let notifications = [];
  let totalNotifications = 0;
  let unreadCount = 0;

  try {
    if (currentUser?.id) {
      const [notifs, totalCount, unread] = await Promise.all([
        getUserNotifications(currentUser.id, { limit: pageSize, offset, filter, search }),
        getUserNotificationsCount(currentUser.id, { filter, search }),
        getUnreadNotificationCount(currentUser.id),
      ]);
      notifications = notifs || [];
      totalNotifications = totalCount || 0;
      unreadCount = unread || 0;

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
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalNotifications}
        initialFilter={filter}
        initialSearchQuery={search}
      />
    </div>
  );
}
