/**
 * Authentication and Role-Based Access Control (RBAC) Architecture
 *
 * NOTE: Full authentication (JWT, cookies, middleware) is prepared for future activation.
 * This module provides clean permission helpers, role definitions, and access checks
 * so authentication can be seamlessly plugged in without altering UI components.
 */

export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  EDITOR_IN_CHIEF: "editor_in_chief",
  EDITOR: "editor",
  SUB_EDITOR: "sub_editor",
  REPORTER: "reporter",
};

export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: "সুপার অ্যাডমিন",
  [USER_ROLES.ADMIN]: "অ্যাডমিন",
  [USER_ROLES.EDITOR_IN_CHIEF]: "প্রধান সম্পাদক",
  [USER_ROLES.EDITOR]: "সম্পাদক",
  [USER_ROLES.SUB_EDITOR]: "সহ-সম্পাদক",
  [USER_ROLES.REPORTER]: "প্রতিবেদক",
};

export const ROLE_BADGE_STYLES = {
  [USER_ROLES.SUPER_ADMIN]: "bg-purple-50 text-purple-700 border-purple-200",
  [USER_ROLES.ADMIN]: "bg-blue-50 text-blue-700 border-blue-200",
  [USER_ROLES.EDITOR_IN_CHIEF]: "bg-amber-50 text-amber-700 border-amber-200",
  [USER_ROLES.EDITOR]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [USER_ROLES.SUB_EDITOR]: "bg-teal-50 text-teal-700 border-teal-200",
  [USER_ROLES.REPORTER]: "bg-slate-100 text-slate-700 border-slate-300",
};

/**
 * Access Matrix defining which roles can view which admin panel modules
 * Derived from requirements in admin_panel_features.md
 */
export const MODULE_PERMISSIONS = {
  analytics: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  "create-article": [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.EDITOR_IN_CHIEF,
    USER_ROLES.EDITOR,
    USER_ROLES.SUB_EDITOR,
    USER_ROLES.REPORTER,
  ],
  "article-list": [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.EDITOR_IN_CHIEF,
    USER_ROLES.EDITOR,
    USER_ROLES.SUB_EDITOR,
  ],
  curation: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.EDITOR_IN_CHIEF],
  categories: [USER_ROLES.SUPER_ADMIN],
  users: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  requests: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
};

/**
 * Default fallback user for active development before Edge Middleware / JWT tokenization is hooked.
 */
export const DEFAULT_DEV_USER = {
  id: "usr_superadmin",
  name: "প্রধান সম্পাদক",
  email: "admin@aloshbe.com",
  role: USER_ROLES.SUPER_ADMIN,
  status: "active",
};

/**
 * Resolves current logged-in user.
 * Currently returns default super admin.
 * When JWT authentication is connected, replace this body with cookie / session extraction.
 */
export async function getCurrentUser() {
  // FUTURE IMPLEMENTATION:
  // const token = (await cookies()).get("auth_token")?.value;
  // if (token) return await verifyToken(token);
  return DEFAULT_DEV_USER;
}

/**
 * Checks if a user has access to a specific module
 */
export function canUserAccessModule(user, moduleId) {
  if (!user || !user.role) return false;
  // Super admin always has complete access
  if (user.role === USER_ROLES.SUPER_ADMIN) return true;

  const allowedRoles = MODULE_PERMISSIONS[moduleId];
  if (!allowedRoles) return true;
  return allowedRoles.includes(user.role);
}

/**
 * Checks if a user has any of the required roles
 */
export function hasRole(user, allowedRoles = []) {
  if (!user || !user.role) return false;
  if (user.role === USER_ROLES.SUPER_ADMIN) return true;
  return allowedRoles.includes(user.role);
}

