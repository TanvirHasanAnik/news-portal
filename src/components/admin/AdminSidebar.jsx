"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getAdminModules, getDefaultAdminModule } from "@/config/adminModules";

export default function AdminSidebar() {
  const searchParams = useSearchParams();
  const defaultModule = getDefaultAdminModule();
  const currentTab = searchParams.get("tab") || defaultModule?.id || "create-article";
  const activeModules = getAdminModules();

  return (
    <aside className="w-full md:w-72 shrink-0 border-r border-slate-200 bg-white md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto flex flex-col justify-between p-4 self-start">
      <div className="space-y-6">
        {/* User Role Card */}
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
          <div className="space-y-1 pt-1.5">
            {activeModules.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <Link
                  key={item.id}
                  href={`/admin?tab=${item.id}`}
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
                        isActive ? "bg-slate-800 text-slate-200" : "text-emerald-700 bg-emerald-50 border-emerald-200"
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
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <span>মূল ওয়েবসাইট দেখুন</span>
          </div>
          <span className="text-xs text-slate-400">↗</span>
        </Link>
      </div>
    </aside>
  );
}
