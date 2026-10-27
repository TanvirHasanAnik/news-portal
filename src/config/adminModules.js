import { adminNavItems, getDefaultAdminNavItem } from "./adminNav";
import AnalyticsModule from "@/modules/admin/analytics";
import ArticleCreateModule from "@/modules/admin/article-create";
import ArticleListModule from "@/modules/admin/article-list";
import CurationModule from "@/modules/admin/curation";
import CategoriesModule from "@/modules/admin/categories";
import UsersModule from "@/modules/admin/users";
import RequestsModule from "@/modules/admin/requests";
import NotificationsModule from "@/modules/admin/notifications";
import ProfileModule from "@/modules/admin/profile";
import { canUserAccessModule } from "@/lib/auth";

const moduleComponents = {
  analytics: AnalyticsModule,
  "create-article": ArticleCreateModule,
  "article-list": ArticleListModule,
  curation: CurationModule,
  categories: CategoriesModule,
  users: UsersModule,
  requests: RequestsModule,
  notifications: NotificationsModule,
  profile: ProfileModule,
};

/**
 * Server-only Admin Module Resolver
 */
export const adminModules = adminNavItems.map((item) => ({
  ...item,
  component: moduleComponents[item.id],
}));

export function getAdminModules(user = null) {
  if (!user) return [];
  return adminModules.filter((mod) => canUserAccessModule(user, mod.id));
}

export function getAdminModuleById(id) {
  return adminModules.find((mod) => mod.id === id) || null;
}

export function getDefaultAdminModule(user = null) {
  const accessible = getAdminModules(user);
  return accessible[0] || null;
}

export { adminNavItems, getDefaultAdminNavItem };
