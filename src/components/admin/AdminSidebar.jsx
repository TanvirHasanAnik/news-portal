"use client";

import { Badge } from "@/components/ui/badge";
import { adminNavItems, getDefaultAdminNavItem } from "@/config/adminNav";
import { useAuth } from "@/contexts/AuthContext";
import { isUpperRole } from "@/config/roles";
import { cn } from "@/lib/utils";
import { Globe, LogOut, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function SidebarContent({
  activeModules,
  currentTab,
  onItemClick,
  user,
  roleNameBn,
  onLogout,
  unreadNotificationsCount = 0,
  pendingArticlesCount = 0,
}) {
  const initialChar = user?.username ? user.username.trim().charAt(0).toUpperCase() : (user?.name ? user.name.trim().charAt(0) : "U");

  return (
    <>
      <div className="space-y-6">

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                {initialChar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user?.username || "ব্যবহারকারী"}
                </p>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {roleNameBn || "অ্যাডমিন"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="লগআউট করুন"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              aria-label="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

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

                  {item.id === "notifications" && unreadNotificationsCount > 0 ? (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-rose-600 rounded-full shadow-2xs">
                      {unreadNotificationsCount > 99
                        ? "৯৯+"
                        : unreadNotificationsCount.toLocaleString("bn-BD")}
                    </span>
                  ) : item.id === "article-list" && isUpperRole(user?.role) && pendingArticlesCount > 0 ? (
                    <span
                      className={cn(
                        "flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full shadow-2xs",
                        isActive
                          ? "bg-amber-400 text-slate-900"
                          : "bg-amber-500 text-white"
                      )}
                    >
                      {pendingArticlesCount > 99
                        ? "৯৯+"
                        : pendingArticlesCount.toLocaleString("bn-BD")}
                    </span>
                  ) : item.badge ? (
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
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200 space-y-2 mt-auto">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>লগআউট</span>
        </button>

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
  const {
    user,
    roleNameBn,
    canAccessTab,
    logout,
    unreadNotificationsCount,
    clearUnreadNotifications,
    pendingArticlesCount,
  } = useAuth();

  const activeModules = adminNavItems.filter((item) => canAccessTab(item.id));
  const fallbackModule = activeModules[0] || getDefaultAdminNavItem();
  const currentTab = searchParams.get("tab") || fallbackModule?.id || "create-article";

  useEffect(() => {
    if (currentTab === "notifications") {
      clearUnreadNotifications?.();
    }
  }, [currentTab, clearUnreadNotifications]);

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

      <aside className="hidden md:flex md:w-72 shrink-0 border-r border-slate-200 bg-white md:fixed md:top-16 md:left-0 md:bottom-0 md:overflow-y-auto flex-col justify-between p-4 z-30">
        <SidebarContent
          activeModules={activeModules}
          currentTab={currentTab}
          user={user}
          roleNameBn={roleNameBn}
          onLogout={logout}
          unreadNotificationsCount={unreadNotificationsCount}
          pendingArticlesCount={pendingArticlesCount}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
          />

          <div className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-left duration-200">

            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <Link
                  href="/admin"
                  onClick={onCloseMobile}
                  className="inline-block bg-white px-2.5 py-1.5 rounded-lg shadow-sm"
                >

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

            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <SidebarContent
                activeModules={activeModules}
                currentTab={currentTab}
                onItemClick={onCloseMobile}
                user={user}
                roleNameBn={roleNameBn}
                onLogout={logout}
                unreadNotificationsCount={unreadNotificationsCount}
                pendingArticlesCount={pendingArticlesCount}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
