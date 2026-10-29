"use client";

import { logoutAction } from "@/actions/authActions";
import {
  canRoleAccessTab,
  getPermissionsForRole,
  hasPermission,
} from "@/config/permissions";
import { ROLES, getRoleById, getRoleName } from "@/config/roles";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({
  children,
  initialUser = null,
  initialUnreadNotificationsCount = 0,
  initialPendingArticlesCount = 0,
}) {
  const router = useRouter();
  const user = initialUser;
  const roleId = user?.role || null;

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(
    initialUnreadNotificationsCount || 0
  );
  const [pendingArticlesCount, setPendingArticlesCount] = useState(
    initialPendingArticlesCount || 0
  );

  const clearUnreadNotifications = useCallback(() => {
    setUnreadNotificationsCount(0);
  }, []);

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
      unreadNotificationsCount,
      setUnreadNotificationsCount,
      clearUnreadNotifications,
      pendingArticlesCount,
      setPendingArticlesCount,
    }),
    [
      user,
      roleId,
      roleObj,
      permissions,
      can,
      canAccessTab,
      hasRole,
      logout,
      unreadNotificationsCount,
      clearUnreadNotifications,
      pendingArticlesCount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function usePermissions() {
  const { can, canAccessTab, hasRole, role, permissions } = useAuth();
  return { can, canAccessTab, hasRole, role, permissions };
}
