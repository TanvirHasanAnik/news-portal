import { USER_ROLES } from "./roles.js";

/**
 * Granular Permissions Definition
 * Covers UI tabs and functional operations across the entire admin panel.
 */
export const PERMISSIONS = {
  // Tabs Access
  TAB_ANALYTICS: "tabs:analytics",
  TAB_CREATE_ARTICLE: "tabs:create-article",
  TAB_ARTICLE_LIST: "tabs:article-list",
  TAB_CURATION: "tabs:curation",
  TAB_CATEGORIES: "tabs:categories",
  TAB_USERS: "tabs:users",
  TAB_REQUESTS: "tabs:requests",

  // Analytics Operations
  ANALYTICS_VIEW: "analytics:view",

  // Article Operations
  ARTICLE_CREATE: "article:create",
  ARTICLE_VIEW_ALL: "article:view_all",
  ARTICLE_EDIT_OWN: "article:edit_own",
  ARTICLE_EDIT_ANY: "article:edit_any",
  ARTICLE_APPROVE: "article:approve",
  ARTICLE_PUBLISH: "article:publish",
  ARTICLE_ARCHIVE: "article:archive",
  ARTICLE_DELETE: "article:delete",

  // Curation Operations (Handpicked, Breaking)
  CURATION_MANAGE: "curation:manage",

  // Category & Subcategory Operations
  CATEGORIES_MANAGE: "categories:manage",

  // User Management Operations
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_EDIT_ROLE: "users:edit_role",
  USERS_DISABLE: "users:disable",

  // Request Management Operations
  REQUESTS_VIEW: "requests:view",
  REQUESTS_CREATE: "requests:create",
  REQUESTS_REVIEW: "requests:review",
};

/**
 * Centralized Roles to Granular Permissions Mapping
 * Directly mapped from admin_panel_features.md:
 *
 * 1. Super Admin:
 *    - All tabs (Categories, Users management, Admin requests review)
 *    - Full permissions (*)
 *
 * 2. Admin:
 *    - Analytics Dashboard
 *    - Request New User, Request Disable User, Request User role change
 *    - Notified about User & curation changes by admin
 *    - Publish, Approve, Edit, Archive Articles
 *    - Handpicked News, Breaking News
 *    - Can see user list but CANNOT edit directly (view only)
 *    - Additional request tab for requesting changes to Super Admin
 *
 * 3. Editor in chief:
 *    - Handpicked News, Breaking News
 *    - Post, Approve, Edit, Archive Articles
 *
 * 4. Editor:
 *    - Post, Approve, Edit, Archive Articles
 *
 * 5. Sub editor:
 *    - Edit or pass Article from reporter and submit for publishing
 *    - Write Articles and Submit
 *
 * 6. Reporter:
 *    - Write Articles and Submit
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: ["*"],

  [USER_ROLES.ADMIN]: [
    PERMISSIONS.TAB_ANALYTICS,
    PERMISSIONS.TAB_CREATE_ARTICLE,
    PERMISSIONS.TAB_ARTICLE_LIST,
    PERMISSIONS.TAB_CURATION,
    PERMISSIONS.TAB_USERS,
    PERMISSIONS.TAB_REQUESTS,

    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_VIEW_ALL,
    PERMISSIONS.ARTICLE_EDIT_OWN,
    PERMISSIONS.ARTICLE_EDIT_ANY,
    PERMISSIONS.ARTICLE_APPROVE,
    PERMISSIONS.ARTICLE_PUBLISH,
    PERMISSIONS.ARTICLE_ARCHIVE,
    PERMISSIONS.ARTICLE_DELETE,
    PERMISSIONS.CURATION_MANAGE,
    PERMISSIONS.USERS_VIEW, // Can view user list, but cannot edit / disable directly
    PERMISSIONS.REQUESTS_VIEW,
    PERMISSIONS.REQUESTS_CREATE, // Can submit requests to Super Admin
  ],

  [USER_ROLES.EDITOR_IN_CHIEF]: [
    PERMISSIONS.TAB_CREATE_ARTICLE,
    PERMISSIONS.TAB_ARTICLE_LIST,
    PERMISSIONS.TAB_CURATION,

    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_VIEW_ALL,
    PERMISSIONS.ARTICLE_EDIT_OWN,
    PERMISSIONS.ARTICLE_EDIT_ANY,
    PERMISSIONS.ARTICLE_APPROVE,
    PERMISSIONS.ARTICLE_PUBLISH,
    PERMISSIONS.ARTICLE_ARCHIVE,
    PERMISSIONS.CURATION_MANAGE,
  ],

  [USER_ROLES.EDITOR]: [
    PERMISSIONS.TAB_CREATE_ARTICLE,
    PERMISSIONS.TAB_ARTICLE_LIST,

    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_VIEW_ALL,
    PERMISSIONS.ARTICLE_EDIT_OWN,
    PERMISSIONS.ARTICLE_EDIT_ANY,
    PERMISSIONS.ARTICLE_APPROVE,
    PERMISSIONS.ARTICLE_PUBLISH,
    PERMISSIONS.ARTICLE_ARCHIVE,
  ],

  [USER_ROLES.SUB_EDITOR]: [
    PERMISSIONS.TAB_CREATE_ARTICLE,
    PERMISSIONS.TAB_ARTICLE_LIST,

    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_VIEW_ALL,
    PERMISSIONS.ARTICLE_EDIT_OWN,
    PERMISSIONS.ARTICLE_EDIT_ANY,
  ],

  [USER_ROLES.REPORTER]: [
    PERMISSIONS.TAB_CREATE_ARTICLE,

    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_EDIT_OWN,
  ],
};

/**
 * Tab ID to Tab Permission Mapping
 */
export const TAB_PERMISSION_MAP = {
  analytics: PERMISSIONS.TAB_ANALYTICS,
  "create-article": PERMISSIONS.TAB_CREATE_ARTICLE,
  "article-list": PERMISSIONS.TAB_ARTICLE_LIST,
  curation: PERMISSIONS.TAB_CURATION,
  categories: PERMISSIONS.TAB_CATEGORIES,
  users: PERMISSIONS.TAB_USERS,
  requests: PERMISSIONS.TAB_REQUESTS,
};

/**
 * Checks if a given role possesses a specific permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  if (role === USER_ROLES.SUPER_ADMIN) return true;

  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes("*")) return true;
  return permissions.includes(permission);
}

/**
 * Checks if a role is authorized to access a specific admin tab
 */
export function canRoleAccessTab(role, tabId) {
  if (!role || !tabId) return false;
  if (role === USER_ROLES.SUPER_ADMIN) return true;

  const requiredPermission = TAB_PERMISSION_MAP[tabId] || `tabs:${tabId}`;
  return hasPermission(role, requiredPermission);
}

/**
 * Retrieves all permissions granted to a role
 */
export function getPermissionsForRole(role) {
  if (!role) return [];
  if (role === USER_ROLES.SUPER_ADMIN) {
    return Object.values(PERMISSIONS);
  }
  return ROLE_PERMISSIONS[role] || [];
}

