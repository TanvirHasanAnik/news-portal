import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminModules, getAdminModuleById, getDefaultAdminModule } from "@/config/adminModules";
import { canUserAccessModule } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

// Ensure this page is dynamically rendered so repository queries reflect live data
export const dynamic = "force-dynamic";

/**
 * Admin Panel Page (Server Component Router for Single-Purpose Modules)
 *
 * Dynamically resolves and renders the active single-purpose module based on the `tab` query param,
 * enforcing role-based tab access control.
 */
export default async function AdminPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const requestedTab = resolvedSearchParams?.tab;
  const user = await getCurrentUser();

  if (!user) {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(AUTH_COOKIE_NAME);
    } catch (_e) {}
    redirect("/admin/login");
  }

  const userModules = getAdminModules(user);
  const defaultUserModule = userModules[0] || null;

  // Resolve requested module if user has permission; otherwise fallback to default authorized module
  let activeModule = null;
  if (requestedTab) {
    if (canUserAccessModule(user, requestedTab)) {
      activeModule = getAdminModuleById(requestedTab);
    }
  }

  if (!activeModule) {
    activeModule = defaultUserModule;
  }

  if (!activeModule) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
        আপনার অ্যাকাউন্টে কোনো অ্যাডমিন মডিউলে প্রবেশের অনুমতি নেই।
      </div>
    );
  }

  const ActiveModuleComponent = activeModule.component;

  return (
    <div className="w-full">
      <ActiveModuleComponent currentUser={user} searchParams={resolvedSearchParams} />
    </div>
  );
}
