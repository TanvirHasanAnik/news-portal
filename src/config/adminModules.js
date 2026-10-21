import { FilePlus2 } from "lucide-react";
import ArticleCreateModule from "@/modules/admin/article-create";

/**
 * Admin Panel Single-Purpose Modules Registry
 *
 * Each tab in the admin panel corresponds to an independent single-purpose module.
 * Only ACTIVE modules registered in this array will be visible in the navigation and accessible in the UI.
 *
 * TO ADD A NEW TAB LATER:
 * 1. Create your module folder under `src/modules/admin/<module-name>/index.jsx`
 * 2. Import the component and add an entry below:
 *    {
 *      id: "article-list",
 *      label: "সকল আর্টিকেল",
 *      icon: FileText,
 *      component: ArticleListModule,
 *    }
 */
export const adminModules = [
  {
    id: "create-article",
    label: "আর্টিকেল তৈরি",
    icon: FilePlus2,
    component: ArticleCreateModule,
  },
  // Future single-purpose modules can be registered here:
  // {
  //   id: "article-list",
  //   label: "সকল আর্টিকেল ও অনুমোদন",
  //   icon: FileText,
  //   component: ArticleListModule,
  // },
  // {
  //   id: "categories",
  //   label: "ক্যাটাগরি ও সাব-ক্যাটাগরি",
  //   icon: FolderTree,
  //   component: CategoryManagementModule,
  // },
  // {
  //   id: "users",
  //   label: "ব্যবহারকারী ব্যবস্থাপনা",
  //   icon: Users,
  //   component: UserManagementModule,
  // },
];

/**
 * Returns all currently registered active admin modules
 */
export function getAdminModules() {
  return adminModules;
}

/**
 * Returns a specific module by its unique ID
 */
export function getAdminModuleById(id) {
  return adminModules.find((mod) => mod.id === id) || null;
}

/**
 * Returns the default fallback module (first active module)
 */
export function getDefaultAdminModule() {
  return adminModules[0] || null;
}

