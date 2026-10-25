"use client";

import { logoutAction } from "@/actions/authActions";
import {
    canRoleAccessTab,
    getPermissionsForRole,
    hasPermission,
} from "@/config/permissions";
import { ROLES, getRoleById, getRoleName } from "@/config/roles";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo } from "react";

const AuthContext = createContext(null);

/**
 * React Context Provider for Application Authentication & Granular RBAC Permissions
 */
export function AuthProvider({ children, initialUser = null }) {
  const router = useRouter();
  const user = initialUser;
  const roleId = user?.role || null;

  const roleObj = useMemo(() => getRoleById(roleId), [roleId]);
  const permissions = useMemo(() => getPermissionsForRole(roleId), [roleId]);

  const can = useCallback(
    (permission) => {
      if (!roleId) return false;
      return hasPermission(roleId, permission);
    },
    [roleId]
  );

  const canAccessTab = useCallback(
    (tabId) => {
      if (!roleId) return false;
      return canRoleAccessTab(roleId, tabId);
    },
    [roleId]
  );

  const hasRole = useCallback(
    (allowedRoles) => {
      if (!roleId) return false;
      if (roleId === ROLES.SUPER_ADMIN.id) return true;
      if (Array.isArray(allowedRoles)) {
        return allowedRoles.includes(roleId);
      }
      return roleId === allowedRoles;
    },
    [roleId]
  );

  const logout = useCallback(async () => {
    try {
      await logoutAction();
    } catch (_err) {
      // In case Server Action redirects, router fallback ensures smooth UX
      router.push("/admin/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      role: roleId,
      roleObj,
      roleNameBn: getRoleName(roleId, "bn"),
      roleNameEn: getRoleName(roleId, "en"),
      permissions,
      isAuthenticated: Boolean(user && user.status === "active"),
      can,
      canAccessTab,
      hasRole,
      logout,
    }),
    [user, roleId, roleObj, permissions, can, canAccessTab, hasRole, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Access the full authentication state
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Policy-based permission hook for Granular RBAC checks (can(), canAccessTab())
 */
export function usePermissions() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("usePermissions must be used within an AuthProvider");
  }
  return {
    can: context.can,
    canAccessTab: context.canAccessTab,
    permissions: context.permissions,
    role: context.role,
    roleObj: context.roleObj,
    roleNameBn: context.roleNameBn,
    roleNameEn: context.roleNameEn,
    hasRole: context.hasRole,
    user: context.user,
  };
}

