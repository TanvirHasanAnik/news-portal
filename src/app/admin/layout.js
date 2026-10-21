import React, { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "অ্যাডমিন প্যানেল | আলো আসবে",
  description: "সংবাদ পোর্টাল অ্যাডমিন ও কনটেন্ট ম্যানেজমেন্ট সিস্টেম",
};

export default function AdminLayout({ children }) {
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
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
