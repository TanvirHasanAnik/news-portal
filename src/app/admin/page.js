import React from "react";
import { getAdminModuleById, getDefaultAdminModule } from "@/config/adminModules";

// Ensure this page is dynamically rendered so repository queries reflect live data
export const dynamic = "force-dynamic";

/**
 * Admin Panel Page (Server Component Router for Single-Purpose Modules)
 *
 * Dynamically resolves and renders the active single-purpose module based on the `tab` query param.
 * Each module handles its own data fetching, UI, and business logic independently.
 */
export default async function AdminPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const requestedTab = resolvedSearchParams?.tab;

  // Resolve module or fallback to default registered active module
  const activeModule = getAdminModuleById(requestedTab) || getDefaultAdminModule();

  if (!activeModule) {
    return (
      <div className="p-8 text-center text-slate-500">
        কোনো সক্রিয় অ্যাডমিন মডিউল পাওয়া যায়নি।
      </div>
    );
  }

  const ActiveModuleComponent = activeModule.component;

  return (
    <div className="w-full">
      <ActiveModuleComponent />
    </div>
  );
}
