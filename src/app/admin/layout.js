import React, { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AuthProvider } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/lib/auth/server";
import { getUnreadNotificationCount } from "@/repositories/notificationRepository";
import { getPendingArticlesCountForUpperRoles } from "@/repositories/articleRepository";
import { isUpperRole } from "@/config/roles";

export const metadata = {
  title: "অ্যাডমিন প্যানেল | আলো আসবে",
  description: "সংবাদ পোর্টাল অ্যাডমিন ও কনটেন্ট ম্যানেজমেন্ট সিস্টেম",
};

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  let unreadNotificationsCount = 0;
  let pendingArticlesCount = 0;

  if (user?.id) {
    try {
      const notifPromise = getUnreadNotificationCount(user.id);
      const pendingPromise =
        user?.role && isUpperRole(user.role)
          ? getPendingArticlesCountForUpperRoles()
          : Promise.resolve(0);

      const [unread, pending] = await Promise.all([notifPromise, pendingPromise]);
      unreadNotificationsCount = unread || 0;
      pendingArticlesCount = pending || 0;
    } catch (_e) {}
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
          <div className="h-16 bg-white border-b border-slate-200 animate-pulse" />
          <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
            <div className="h-32 bg-white rounded-xl shadow-sm animate-pulse" />
          </div>
        </div>
      }
    >
      <AuthProvider
        initialUser={user}
        initialUnreadNotificationsCount={unreadNotificationsCount}
        initialPendingArticlesCount={pendingArticlesCount}
      >
        <AdminShell>{children}</AdminShell>
      </AuthProvider>
    </Suspense>
  );
}
