"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Menu, LogOut, User, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function AdminHeader({ onMenuToggle }) {
  const { user, roleNameBn, roleObj, logout, unreadNotificationsCount } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle + Branding with Main Logo SVG */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Hamburger toggle */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 shrink-0 cursor-pointer transition-colors"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin" className="flex items-center gap-2.5 group focus:outline-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo.svg"
              alt="আমাদের সংবাদ"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200 select-none hidden sm:inline-block">
              অ্যাডমিন প্যানেল
            </span>
          </Link>
        </div>

        {/* Right: User Role Info, Notifications, Live Site Link & Quick Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {user && (
            <>
              <Link
                href="/admin?tab=notifications"
                title="নোটিফিকেশন দেখুন"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer relative"
                aria-label="নোটিফিকেশন"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-white shadow-2xs">
                    {unreadNotificationsCount > 99
                      ? "৯৯+"
                      : unreadNotificationsCount.toLocaleString("bn-BD")}
                  </span>
                )}
              </Link>

              <Link
                href="/admin?tab=profile"
                title="প্রোফাইল সেটিংস দেখুন"
                className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-200 hover:opacity-85 transition-opacity"
              >
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {user.fullName || user.name || user.username}
                </span>
                <Badge
                  className={`text-[10px] py-0.5 px-2 font-semibold ${
                    roleObj?.badgeClass || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {roleNameBn}
                </Badge>
              </Link>
            </>
          )}

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            লাইভ সাইট <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={logout}
            title="লগআউট"
            className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
            aria-label="লগআউট করুন"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
