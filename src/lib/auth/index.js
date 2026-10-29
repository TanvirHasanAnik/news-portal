

import {
  ROLES,
  USER_ROLES,
  ROLE_LABELS,
  ROLE_BADGE_STYLES,
  ALL_ROLES,
  SINGLE_USER_ROLES,
  isSingleUserRole,
  ASSIGNABLE_ROLES,
  ASSIGNABLE_ROLE_IDS,
  ASSIGNABLE_ROLE_LABELS,
  UPPER_ROLES,
  LOWER_ROLES,
  isUpperRole,
  isLowerRole,
  getRoleById,
  getRoleName,
  getRoleBadgeClass,
} from "@/config/roles";
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  TAB_PERMISSION_MAP,
  hasPermission,
  canRoleAccessTab,
  getPermissionsForRole,
} from "@/config/permissions";

export {
  ROLES,
  USER_ROLES,
  ROLE_LABELS,
  ROLE_BADGE_STYLES,
  ALL_ROLES,
  SINGLE_USER_ROLES,
  isSingleUserRole,
  ASSIGNABLE_ROLES,
  ASSIGNABLE_ROLE_IDS,
  ASSIGNABLE_ROLE_LABELS,
  UPPER_ROLES,
  LOWER_ROLES,
  isUpperRole,
  isLowerRole,
  getRoleById,
  getRoleName,
  getRoleBadgeClass,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  TAB_PERMISSION_MAP,
  hasPermission,
  canRoleAccessTab,
  getPermissionsForRole,
};

export function canUserAccessModule(user, moduleId) {
  if (!user || !user.role) return false;
  return canRoleAccessTab(user.role, moduleId);
}

export function hasRole(user, allowedRoles = []) {
  if (!user || !user.role) return false;
  if (user.role === USER_ROLES.SUPER_ADMIN) return true;
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(user.role);
  }
  return user.role === allowedRoles;
}
