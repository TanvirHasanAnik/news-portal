"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserPlus,
  UserX,
  UserCheck,
  X,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  createUserAction,
  updateUserRoleAction,
  toggleUserStatusAction,
} from "@/actions/userActions";
import {
  ROLE_LABELS,
  ROLE_BADGE_STYLES,
  USER_ROLES,
  ASSIGNABLE_ROLE_LABELS,
  isSingleUserRole,
} from "@/lib/auth";
import { usePermissions } from "@/contexts/AuthContext";
import { createUserSchema } from "@/schemas/userSchema";

export function UserManager({
  initialUsers = [],
  canCreate: propCanCreate,
  canEditRole: propCanEditRole,
  canDisable: propCanDisable,
}) {
  const { can } = usePermissions();

  // Policy-based RBAC permission checks (overridable via props)
  const canCreateUser = propCanCreate !== undefined ? propCanCreate : can("users:create");
  const canChangeRole = propCanEditRole !== undefined ? propCanEditRole : can("users:edit_role");
  const canToggleUser = propCanDisable !== undefined ? propCanDisable : can("users:disable");

  const [users, setUsers] = useState(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);

  // Initialize React Hook Form with real-time validation via Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: USER_ROLES.REPORTER,
    },
  });

  const onCreateUser = (data) => {
    if (isSingleUserRole(data.role)) {
      setFeedback({ type: "error", message: "এই পদে নতুন ব্যবহারকারী যোগ করা সম্ভব নয়।" });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("email", data.email.trim());
      formData.append("password", data.password.trim());
      formData.append("role", data.role);
      formData.append("bio", "");

      const res = await createUserAction(null, formData);
      if (res.success) {
        setUsers((prev) => [
          ...prev,
          {
            id: `usr_${Date.now()}`,
            name: data.name.trim(),
            email: data.email.trim(),
            role: data.role,
            status: "active",
            bio: "",
            created_at: new Date().toISOString(),
          },
        ]);
        setFeedback({ type: "success", message: res.message });
        reset({ name: "", email: "", password: "", role: USER_ROLES.REPORTER });
        setShowAddModal(false);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  // Re-confirmation modal on role selection
  const onRoleSelectChange = (usr, newRole) => {
    if (isSingleUserRole(usr.role) || isSingleUserRole(newRole)) return;
    if (newRole === usr.role) return;
    const oldRoleLabel = ROLE_LABELS[usr.role] || usr.role;
    const newRoleLabel = ROLE_LABELS[newRole] || newRole;

    setConfirmConfig({
      message: `আপনি কি "${usr.name}"-এর দায়িত্ব "${oldRoleLabel}" থেকে "${newRoleLabel}"-এ পরিবর্তন করতে চান?`,
      onConfirm: () => {
        setConfirmConfig(null);
        startTransition(async () => {
          const res = await updateUserRoleAction(usr.id, newRole);
          if (res.success) {
            setUsers((prev) =>
              prev.map((u) => (u.id === usr.id ? { ...u, role: newRole } : u))
            );
            setFeedback({ type: "success", message: res.message });
          } else {
            setFeedback({ type: "error", message: res.message });
          }
          setTimeout(() => setFeedback(null), 3000);
        });
      },
    });
  };

  const handleToggleStatus = (userId, currentStatus, userName, userRole) => {
    if (isSingleUserRole(userRole)) return;
    const actionLabel = currentStatus === "active" ? "নিষ্ক্রিয়" : "পুনরায় সক্রিয়";
    setConfirmConfig({
      message: `আপনি কি নিশ্চিতভাবে "${userName}" কে ${actionLabel} করতে চান?`,
      confirmVariant: currentStatus === "active" ? "destructive" : "default",
      onConfirm: () => {
        setConfirmConfig(null);
        startTransition(async () => {
          const res = await toggleUserStatusAction(userId, currentStatus);
          if (res.success) {
            setUsers((prev) =>
              prev.map((u) => (u.id === userId ? { ...u, status: res.status } : u))
            );
            setFeedback({ type: "success", message: res.message });
          } else {
            setFeedback({ type: "error", message: res.message });
          }
          setTimeout(() => setFeedback(null), 3000);
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="cursor-pointer">×</button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            নিবন্ধিত সদস্য তালিকা ({users.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {canCreateUser
              ? "প্রতিবেদক, বার্তা সম্পাদক ও অন্যান্য সদস্যদের দায়িত্ব নির্ধারণ করুন"
              : "নিবন্ধিত সকল সদস্যদের তালিকা দেখুন (পরিবর্তনের জন্য আবেদন ট্যাব ব্যবহার করুন)"}
          </p>
        </div>

        {canCreateUser ? (
          <Button
            onClick={() => {
              reset({ name: "", email: "", password: "", role: USER_ROLES.REPORTER });
              setShowAddModal(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            নতুন সদস্য যোগ করুন
          </Button>
        ) : (
          <Link
            href="/admin?tab=requests"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs self-start sm:self-auto transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            নতুন সদস্যের আবেদন করুন
          </Link>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                <th className="py-3 px-4">নাম ও পরিচিতি</th>
                <th className="py-3 px-4">ইমেইল</th>
                <th className="py-3 px-4">দায়িত্ব (রোল)</th>
                <th className="py-3 px-4">অবস্থা</th>
                <th className="py-3 px-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((usr) => {
                const roleBadge = ROLE_BADGE_STYLES[usr.role] || "bg-slate-100 text-slate-700";
                const isSingleUser = isSingleUserRole(usr.role);

                return (
                  <tr key={usr.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & Bio */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{usr.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {usr.bio || "কোনো বিবরণ নেই"}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {usr.email}
                    </td>

                    {/* Role Selector or Badge (Single user roles are permanent badges) */}
                    <td className="py-3 px-4">
                      {isSingleUser || !canChangeRole ? (
                        <Badge className={`${roleBadge} text-[10px] py-0.5 px-2 font-semibold`}>
                          {ROLE_LABELS[usr.role] || usr.role}
                        </Badge>
                      ) : (
                        <select
                          value={usr.role}
                          onChange={(e) => onRoleSelectChange(usr, e.target.value)}
                          disabled={isPending}
                          className="h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                        >
                          {Object.entries(ASSIGNABLE_ROLE_LABELS).map(([rKey, rLabel]) => (
                            <option key={rKey} value={rKey}>
                              {rLabel}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {usr.status === "active" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          সক্রিয়
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          নিষ্ক্রিয়
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isSingleUser ? (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      ) : canToggleUser ? (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(usr.id, usr.status, usr.name, usr.role)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                            usr.status === "active"
                              ? "text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                              : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {usr.status === "active" ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              নিষ্ক্রিয় করুন
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              সক্রিয় করুন
                            </>
                          )}
                        </button>
                      ) : (
                        <Link
                          href="/admin?tab=requests"
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          আবেদন করুন
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal: Only lists assignable staff roles */}
      {showAddModal && canCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  নতুন ব্যবহারকারী যোগ করুন
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreateUser)} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ব্যবহারকারীর পুরো নাম <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="যেমন: তানভীর আহমেদ"
                  {...register("name")}
                  className={`text-xs h-9 ${errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইমেইল ঠিকানা <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`text-xs h-9 ${errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  প্রাথমিক পাসওয়ার্ড <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                  {...register("password")}
                  className={`text-xs h-9 ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {errors.password && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  দায়িত্ব ও পদবী (Role) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("role")}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {Object.entries(ASSIGNABLE_ROLE_LABELS).map(([rKey, rLabel]) => (
                    <option key={rKey} value={rKey}>
                      {rLabel}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.role.message}</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {isPending ? "সংরক্ষণ হচ্ছে..." : "যোগ করুন"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Re-confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmConfig)}
        onClose={() => setConfirmConfig(null)}
        onConfirm={confirmConfig?.onConfirm}
        message={confirmConfig?.message}
        confirmVariant={confirmConfig?.confirmVariant || "default"}
      />
    </div>
  );
}
