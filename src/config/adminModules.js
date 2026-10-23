import { adminNavItems, getDefaultAdminNavItem } from "./adminNav";
import AnalyticsModule from "@/modules/admin/analytics";
import ArticleCreateModule from "@/modules/admin/article-create";
import ArticleListModule from "@/modules/admin/article-list";
import CurationModule from "@/modules/admin/curation";
import CategoriesModule from "@/modules/admin/categories";
import UsersModule from "@/modules/admin/users";
import RequestsModule from "@/modules/admin/requests";
import { canUserAccessModule } from "@/lib/auth";

const moduleComponents = {
  analytics: AnalyticsModule,
  "create-article": ArticleCreateModule,
  "article-list": ArticleListModule,
  curation: CurationModule,
  categories: CategoriesModule,
  users: UsersModule,
  requests: RequestsModule,
};

/**
 * Server-only Admin Module Resolver
 */
export const adminModules = adminNavItems.map((item) => ({
  ...item,
  component: moduleComponents[item.id],
}));

export function getAdminModules(user = null) {
  if (!user) return adminModules;
  return adminModules.filter((mod) => canUserAccessModule(user, mod.id));
}

export function getAdminModuleById(id) {
  return adminModules.find((mod) => mod.id === id) || null;
}

export function getDefaultAdminModule() {
  return adminModules[0] || null;
}

export { adminNavItems, getDefaultAdminNavItem };
