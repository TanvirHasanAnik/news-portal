import { canUserAccessModule, isLowerRole } from "@/lib/auth";
import {
  BarChart3,
  Bell,
  ClipboardList,
  FilePlus2,
  FileText,
  FolderTree,
  Sparkles,
  UserCircle,
  Users,
} from "lucide-react";

/**
 * Client-safe navigation definitions for Admin Panel sidebar and header.
 * Free of Server Components and database repositories.
 */
export const adminNavItems = [
  {
    id: "analytics",
    label: "অ্যানালিটিক্স ড্যাশবোর্ড",
    icon: BarChart3,
  },
  {
    id: "create-article",
    label: "আর্টিকেল তৈরি",
    icon: FilePlus2,
  },
  {
    id: "article-list",
    label: "আর্টিকেল তালিকা",
    icon: FileText,
  },
  {
    id: "curation",
    label: "বাছাইকৃত ও জরুরি সংবাদ",
    icon: Sparkles,
  },
  {
    id: "categories",
    label: "ক্যাটাগরি ও সাব-ক্যাটাগরি",
    icon: FolderTree,
  },
  {
    id: "users",
    label: "ব্যবহারকারী ব্যবস্থাপনা",
    icon: Users,
  },
  {
    id: "requests",
    label: "অ্যাডমিন আবেদনসমূহ",
    icon: ClipboardList,
  },
  {
    id: "notifications",
    label: "নোটিফিকেশন",
    icon: Bell,
  },
  {
    id: "profile",
    label: "প্রোফাইল সেটিংস",
    icon: UserCircle,
  },
];

export function getAdminNavItems(user = null) {
  if (!user) return adminNavItems;
  const isLower = isLowerRole(user.role);
  return adminNavItems
    .filter((item) => canUserAccessModule(user, item.id))
    .map((item) => {
      if (item.id === "article-list" && isLower) {
        return {
          ...item,
          label: "আমার আর্টিকেলসমূহ",
        };
      }
      return item;
    });
}

export function getDefaultAdminNavItem() {
  return adminNavItems[0] || null;
}
