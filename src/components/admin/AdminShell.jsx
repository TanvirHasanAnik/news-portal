"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans subpixel-antialiased">
      <AdminHeader onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />

      <div className="flex-1 flex flex-col md:flex-row">
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="flex-1 md:ml-72 min-w-0">
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
