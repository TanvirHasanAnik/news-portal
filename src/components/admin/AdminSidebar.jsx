"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FilePlus2,
  FileText,
  History,
  Sparkles,
  Flame,
  FolderTree,
  Users,
  Inbox,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Globe,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const adminNavigationTabs = [
  {
    group: "সম্পাদকীয় ও কন্টেন্ট",
    items: [
      {
        id: "create-article",
        label: "আর্টিকেল তৈরি",
        icon: FilePlus2,
        href: "/admin?tab=create-article",
        isActiveCurrent: true,
        badge: "Active",
        badgeVariant: "success",
      },
      {
        id: "article-list",
        label: "সকল আর্টিকেল ও অনুমোদন",
        icon: FileText,
        href: "/admin?tab=article-list",
        isActiveCurrent: false,
        badge: "Phase 2",
      },
      {
        id: "revisions",
        label: "রিভিশন কন্ট্রোল / ইতিহাস",
        icon: History,
        href: "/admin?tab=revisions",
        isActiveCurrent: false,
      },
    ],
  },
  {
    group: "কিউরেশন (এডিটর ইন চিফ)",
    items: [
      {
        id: "handpicked",
        label: "বাছাইকৃত সংবাদ",
        icon: Sparkles,
        href: "/admin?tab=handpicked",
        isActiveCurrent: false,
      },
      {
        id: "breaking",
        label: "ব্রেকিং নিউজ",
        icon: Flame,
        href: "/admin?tab=breaking",
        isActiveCurrent: false,
      },
    ],
  },
  {
    group: "সুপার অ্যাডমিন ব্যবস্থাপনা",
    items: [
      {
        id: "users",
        label: "ব্যবহারকারী ব্যবস্থাপনা",
        icon: Users,
        href: "/admin?tab=users",
        isActiveCurrent: false,
        badge: "Super Admin",
      },
      {
        id: "categories",
        label: "ক্যাটাগরি ও সাব-ক্যাটাগরি",
        icon: FolderTree,
        href: "/admin?tab=categories",
        isActiveCurrent: false,
      },
      {
        id: "requests",
        label: "অ্যাডমিন অনুরোধ তালিকা",
        icon: Inbox,
        href: "/admin?tab=requests",
        isActiveCurrent: false,
      },
    ],
  },
  {
    group: "অ্যানালিটিক্স ও অডিট",
    items: [
      {
        id: "analytics",
        label: "ভিজিটর ও পেজভিউ ড্যাশবোর্ড",
        icon: BarChart3,
        href: "/admin?tab=analytics",
        isActiveCurrent: false,
      },
      {
        id: "audit-logs",
        label: "অ্যাডমিন অডিট লগ",
        icon: ShieldCheck,
        href: "/admin?tab=audit-logs",
        isActiveCurrent: false,
      },
    ],
  },
];

export default function AdminSidebar() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "create-article";

  return (
    <aside className="w-72 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-65px)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* User Role Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              বর্তমান ভূমিকা
            </span>
            <Badge variant="default" className="bg-red-600 text-white hover:bg-red-700 text-[10px]">
              সুপার অ্যাডমিন
            </Badge>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              প্র
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">প্রধান সম্পাদক</p>
              <p className="text-xs text-slate-500 truncate">admin@aloshbe.com</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-6">
          {adminNavigationTabs.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="px-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                {group.group}
              </h4>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
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
                            isActive ? "bg-slate-800 text-slate-200" : "text-slate-500"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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
        <p className="px-3 text-[11px] text-slate-400">
          ক্লাউডফ্লেয়ার D1 ও R2 রেডি আর্কিটেকচার
        </p>
      </div>
    </aside>
  );
}

