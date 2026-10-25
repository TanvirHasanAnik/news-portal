/**
 * Centralized Role Definitions
 * Reusable across the entire project with English and Bengali strings.
 * Aligned with admin_panel_features.md specifications.
 */

export const ROLES = {
  SUPER_ADMIN: {
    id: "super_admin",
    nameEn: "Super Admin",
    nameBn: "সুপার অ্যাডমিন",
    shortBn: "সুপার অ্যাডমিন",
    descriptionEn: "Full administrative access and system control",
    descriptionBn: "সর্বোচ্চ প্রশাসনিক ক্ষমতা, মডিউল নিয়ন্ত্রণ ও কনটেন্ট পরিচালনা",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  ADMIN: {
    id: "admin",
    nameEn: "Admin",
    nameBn: "অ্যাডমিন",
    shortBn: "অ্যাডমিন",
    descriptionEn: "Administrative access with oversight and request-based user management",
    descriptionBn: "অ্যানালিটিক্স, কনটেন্ট কিউরেশন ও পরিবর্তন আবেদন করার সুযোগ",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  EDITOR_IN_CHIEF: {
    id: "editor_in_chief",
    nameEn: "Editor in Chief",
    nameBn: "প্রধান সম্পাদক",
    shortBn: "প্রধান সম্পাদক",
    descriptionEn: "Top editorial authority, breaking news curation, and article publishing",
    descriptionBn: "জরুরি সংবাদ কিউরেশন, সকল সংবাদ প্রকাশ ও অনুমোদন নিয়ন্ত্রণ",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  EDITOR: {
    id: "editor",
    nameEn: "Editor",
    nameBn: "সম্পাদক",
    shortBn: "সম্পাদক",
    descriptionEn: "Editorial oversight, post, approve, edit, and archive articles",
    descriptionBn: "সংবাদ তৈরি, সম্পাদনা, অনুমোদন এবং আর্কাইভ কার্যক্রম",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  SUB_EDITOR: {
    id: "sub_editor",
    nameEn: "Sub Editor",
    nameBn: "সহ-সম্পাদক",
    shortBn: "সহ-সম্পাদক",
    descriptionEn: "Review reporter submissions, edit articles, and submit for publication",
    descriptionBn: "প্রতিবেদকের সংবাদ সংশোধন ও সম্পাদনা শেষে প্রকাশের জন্য পেশ",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  REPORTER: {
    id: "reporter",
    nameEn: "Reporter",
    nameBn: "প্রতিবেদক",
    shortBn: "প্রতিবেদক",
    descriptionEn: "Draft and submit news articles for editorial review",
    descriptionBn: "মাঠপর্যায়ের সংবাদ তৈরি এবং প্রাথমিক খসড়া জমা দান",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

export const ROLE_KEYS = Object.keys(ROLES);
export const ALL_ROLES = Object.values(ROLES);

/**
 * Single-User System Roles
 * These roles are singleton/fixed and provided solely via initial configuration.
 * No user can be created with or promoted to these roles.
 */
export const SINGLE_USER_ROLES = [
  ROLES.SUPER_ADMIN.id,
  ROLES.ADMIN.id,
];

export function isSingleUserRole(roleId) {
  if (!roleId) return false;
  return SINGLE_USER_ROLES.includes(roleId);
}

/**
 * Roles that can be assigned to new or existing staff by Super Admin
 */
export const ASSIGNABLE_ROLES = [
  ROLES.EDITOR_IN_CHIEF,
  ROLES.EDITOR,
  ROLES.SUB_EDITOR,
  ROLES.REPORTER,
];

export const ASSIGNABLE_ROLE_IDS = ASSIGNABLE_ROLES.map((r) => r.id);

export const ASSIGNABLE_ROLE_LABELS = Object.fromEntries(
  ASSIGNABLE_ROLES.map((r) => [r.id, r.nameBn])
);

export function getRoleById(roleId) {
  if (!roleId) return null;
  return ALL_ROLES.find((r) => r.id === roleId) || null;
}

export function getRoleName(roleId, lang = "bn") {
  const role = getRoleById(roleId);
  if (!role) return roleId || "";
  return lang === "en" ? role.nameEn : role.nameBn;
}

export function getRoleBadgeClass(roleId) {
  const role = getRoleById(roleId);
  return role ? role.badgeClass : "bg-slate-100 text-slate-700 border-slate-300";
}

// Backward-compatible exports for existing codebase
export const USER_ROLES = {
  SUPER_ADMIN: ROLES.SUPER_ADMIN.id,
  ADMIN: ROLES.ADMIN.id,
  EDITOR_IN_CHIEF: ROLES.EDITOR_IN_CHIEF.id,
  EDITOR: ROLES.EDITOR.id,
  SUB_EDITOR: ROLES.SUB_EDITOR.id,
  REPORTER: ROLES.REPORTER.id,
};

export const ROLE_LABELS = Object.fromEntries(
  ALL_ROLES.map((r) => [r.id, r.nameBn])
);

export const ROLE_BADGE_STYLES = Object.fromEntries(
  ALL_ROLES.map((r) => [r.id, r.badgeClass])
);
