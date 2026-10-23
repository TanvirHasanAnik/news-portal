"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Globe, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getAdminNavItems, getDefaultAdminNavItem } from "@/config/adminNav";

/**
 * Shared sidebar content used in both desktop sidebar and mobile drawer
 */
function SidebarContent({ activeModules, currentTab, onItemClick }) {
  return (
    <>
      <div className="space-y-6">
        {/* User Role Profile Card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
              সু
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">সুপার অ্যাডমিন</p>
              <p className="text-xs text-slate-500 truncate">admin@aloshbe.com</p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation for Registered Active Modules */}
        <nav className="space-y-1">
          <div className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            অ্যাডমিন মডিউল
          </div>
          <div className="space-y-1">
            {activeModules.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <Link
                  key={item.id}
                  href={`/admin?tab=${item.id}`}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-slate-900 text-white font-semibold shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        isActive
                          ? "bg-slate-800 text-slate-200"
                          : "text-emerald-700 bg-emerald-50 border-emerald-200"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 space-y-2 mt-auto">
        <Link
          href="/"
          target="_blank"
          onClick={onItemClick}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <span>মূল ওয়েবসাইট দেখুন</span>
          </div>
          <span className="text-xs text-slate-400">↗</span>
        </Link>
      </div>
    </>
  );
}

export default function AdminSidebar({ mobileOpen = false, onCloseMobile }) {
  const searchParams = useSearchParams();
  const defaultModule = getDefaultAdminNavItem();
  const currentTab = searchParams.get("tab") || defaultModule?.id || "create-article";
  const activeModules = getAdminNavItems();

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCloseMobile?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {/* 1. Desktop Persistent Sticky Sidebar (Visible on md+ screens) */}
      <aside className="hidden md:flex md:w-72 shrink-0 border-r border-slate-200 bg-white md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto flex-col justify-between p-4 self-start">
        <SidebarContent activeModules={activeModules} currentTab={currentTab} />
      </aside>

      {/* 2. Mobile Slide-in Drawer Toggle (Visible on <md screens when opened) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
          />

          {/* Slide-in Drawer */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-left duration-200">
            {/* Drawer Header with Logo & Close Button (Matching Public MobileDrawer style) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <Link
                  href="/admin"
                  onClick={onCloseMobile}
                  className="inline-block bg-white px-2.5 py-1.5 rounded-lg shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand-logo.svg"
                    alt="আমাদের সংবাদ"
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  অ্যাডমিন কন্ট্রোল প্যানেল
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <SidebarContent
                activeModules={activeModules}
                currentTab={currentTab}
                onItemClick={onCloseMobile}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
