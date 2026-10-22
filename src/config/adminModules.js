import {
  BarChart3,
  FilePlus2,
  FileText,
  Sparkles,
  FolderTree,
  Users,
  ClipboardList,
} from "lucide-react";

import AnalyticsModule from "@/modules/admin/analytics";
import ArticleCreateModule from "@/modules/admin/article-create";
import ArticleListModule from "@/modules/admin/article-list";
import CurationModule from "@/modules/admin/curation";
import CategoriesModule from "@/modules/admin/categories";
import UsersModule from "@/modules/admin/users";
import RequestsModule from "@/modules/admin/requests";
import { canUserAccessModule } from "@/lib/auth";

/**
 * Admin Panel Single-Purpose Modules Registry
 *
 * Each tab corresponds to an independent server-driven module.
 * Future roles/auth easily filter this list using `canUserAccessModule(user, mod.id)`.
 */
export const adminModules = [
  {
    id: "analytics",
    label: "অ্যানালিটিক্স ড্যাশবোর্ড",
    icon: BarChart3,
    component: AnalyticsModule,
  },
  {
    id: "create-article",
    label: "আর্টিকেল তৈরি",
    icon: FilePlus2,
    component: ArticleCreateModule,
  },
  {
    id: "article-list",
    label: "সকল আর্টিকেল ও অনুমোদন",
    icon: FileText,
    component: ArticleListModule,
  },
  {
    id: "curation",
    label: "বাছাইকৃত ও জরুরি সংবাদ",
    icon: Sparkles,
    component: CurationModule,
  },
  {
    id: "categories",
    label: "ক্যাটাগরি ও সাব-ক্যাটাগরি",
    icon: FolderTree,
    component: CategoriesModule,
  },
  {
    id: "users",
    label: "ব্যবহারকারী ব্যবস্থাপনা",
    icon: Users,
    component: UsersModule,
  },
  {
    id: "requests",
    label: "অ্যাডমিন আবেদনসমূহ",
    icon: ClipboardList,
    component: RequestsModule,
  },
];

/**
 * Returns all currently registered active admin modules, optionally filtered by user role
 */
export function getAdminModules(user = null) {
  if (!user) return adminModules;
  return adminModules.filter((mod) => canUserAccessModule(user, mod.id));
}

/**
 * Returns a specific module by its unique ID
 */
export function getAdminModuleById(id) {
  return adminModules.find((mod) => mod.id === id) || null;
}

/**
 * Returns the default fallback module
 */
export function getDefaultAdminModule() {
  return adminModules[0] || null;
}
