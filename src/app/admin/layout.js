import React, { Suspense } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "অ্যাডমিন প্যানেল | আলো আসবে",
  description: "সংবাদ পোর্টাল অ্যাডমিন ও কনটেন্ট ম্যানেজমেন্ট সিস্টেম",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans subpixel-antialiased">
      {/* 1. Admin Top Navigation Bar */}
      <AdminHeader />

      {/* 2. Admin Body with Sidebar and Main Canvas */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar wrapped in Suspense for useSearchParams */}
        <Suspense
          fallback={
            <div className="w-72 shrink-0 border-r border-slate-200 bg-white p-4 hidden md:block md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
              <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          }
        >
          <AdminSidebar />
        </Suspense>

        {/* Dynamic Admin View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

