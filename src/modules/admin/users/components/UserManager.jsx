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
  KeyRound,
  Eye,
  EyeOff,
  Lock,
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
import { adminResetStaffPasswordAction } from "@/actions/authActions";
import {
  ROLE_LABELS,
  ROLE_BADGE_STYLES,
  USER_ROLES,
  ASSIGNABLE_ROLE_LABELS,
  isSingleUserRole,
} from "@/lib/auth";
import { usePermissions, useAuth } from "@/contexts/AuthContext";
import { createUserSchema } from "@/schemas/userSchema";

const ROLE_HIERARCHY_ORDER = {
  super_admin: 1,
  superadmin: 1,
  admin: 2,
  editor_in_chief: 3,
  editor: 4,
  sub_editor: 5,
  reporter: 6,
};

function sortUsersByRole(userList = []) {
  return [...userList].sort((a, b) => {
    const orderA = ROLE_HIERARCHY_ORDER[a.role] || 99;
    const orderB = ROLE_HIERARCHY_ORDER[b.role] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
  });
}

export function UserManager({
  initialUsers = [],
  canCreate: propCanCreate,
  canEditRole: propCanEditRole,
  canDisable: propCanDisable,
}) {
  const { can } = usePermissions();
  const { user: currentUser } = useAuth();

  const isSuperAdmin = currentUser?.role === "super_admin";


  const canCreateUser = propCanCreate !== undefined ? propCanCreate : can("users:create");
  const canChangeRole = propCanEditRole !== undefined ? propCanEditRole : can("users:edit_role");
  const canToggleUser = propCanDisable !== undefined ? propCanDisable : can("users:disable");

  const [users, setUsers] = useState(() => sortUsersByRole(initialUsers));
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);


  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [isResetPending, startResetTransition] = useTransition();


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      phone: "",
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
      formData.append("username", data.username.trim().toLowerCase());
      formData.append("fullName", (data.fullName || "").trim());
      formData.append("email", (data.email || "").trim().toLowerCase());
      formData.append("phone", (data.phone || "").trim());
      formData.append("password", data.password.trim());
      formData.append("role", data.role);
      formData.append("bio", "");

      const res = await createUserAction(null, formData);
      if (res.success) {
        const newUserObj = res.user || {
          id: `usr_${Date.now()}`,
          username: data.username.trim().toLowerCase(),
          full_name: (data.fullName || "").trim(),
          name: (data.fullName || data.username).trim(),
          email: (data.email || "").trim(),
          phone: (data.phone || "").trim(),
          role: data.role,
          status: "active",
          bio: "",
          created_at: new Date().toISOString(),
        };
        setUsers((prev) => sortUsersByRole([...prev, newUserObj]));
        setFeedback({ type: "success", message: res.message });
        reset({
          username: "",
          fullName: "",
          email: "",
          phone: "",
          password: "",
          role: USER_ROLES.REPORTER,
        });
        setShowAddModal(false);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };


  const onRoleSelectChange = (usr, newRole) => {
    if (isSingleUserRole(usr.role) || isSingleUserRole(newRole)) return;
    if (newRole === usr.role) return;
    const oldRoleLabel = ROLE_LABELS[usr.role] || usr.role;
    const newRoleLabel = ROLE_LABELS[newRole] || newRole;

    setConfirmConfig({
      message: `আপনি কি "${usr.name || usr.username}"-এর দায়িত্ব "${oldRoleLabel}" থেকে "${newRoleLabel}"-এ পরিবর্তন করতে চান?`,
      onConfirm: () => {
        setConfirmConfig(null);
        startTransition(async () => {
          const res = await updateUserRoleAction(usr.id, newRole);
          if (res.success) {
            setUsers((prev) =>
              sortUsersByRole(prev.map((u) => (u.id === usr.id ? { ...u, role: newRole } : u)))
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


  const handleResetStaffPasswordSubmit = (e) => {
    e.preventDefault();
    setResetError("");

    if (!resetTargetUser) return;

    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetError("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।");
      return;
    }

    startResetTransition(async () => {
      const formData = new FormData();
      formData.append("userId", resetTargetUser.id);
      formData.append("newPassword", resetNewPassword);

      const res = await adminResetStaffPasswordAction(null, formData);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setResetTargetUser(null);
        setResetNewPassword("");
        setResetConfirmPassword("");
      } else {
        setResetError(res.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।");
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  return (
    <div className="space-y-6">

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


      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            নিবন্ধিত সদস্য তালিকা ({users.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {canCreateUser
              ? "প্রতিবেদক, বার্তা সম্পাদক ও অন্যান্য সদস্যদের দায়িত্ব ও পাসওয়ার্ড পরিচালনা করুন"
              : "নিবন্ধিত সকল সদস্যদের তালিকা দেখুন (পরিবর্তনের জন্য আবেদন ট্যাব ব্যবহার করুন)"}
          </p>
        </div>

        {canCreateUser ? (
          <Button
            onClick={() => {
              reset({
                username: "",
                fullName: "",
                email: "",
                phone: "",
                password: "",
                role: USER_ROLES.REPORTER,
              });
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


      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                <th className="py-3 px-4">নাম ও পরিচিতি</th>
                <th className="py-3 px-4">ইউজারনেম</th>
                <th className="py-3 px-4">যোগাযোগ</th>
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

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {usr.full_name || usr.username}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {usr.bio || "কোনো বিবরণ নেই"}
                      </div>
                    </td>


                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        @{usr.username}
                      </span>
                    </td>


                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      <div>{usr.email || <span className="text-slate-400">—</span>}</div>
                      {usr.phone && (
                        <div className="text-slate-400 text-[10px] mt-0.5 font-mono">{usr.phone}</div>
                      )}
                    </td>


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


                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isSingleUser ? (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">

                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setResetTargetUser(usr);
                                setResetNewPassword("");
                                setResetConfirmPassword("");
                                setResetError("");
                              }}
                              title="পাসওয়ার্ড পরিবর্তন করুন"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                              পাসওয়ার্ড
                            </button>
                          )}


                          {canToggleUser ? (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(usr.id, usr.status, usr.name || usr.username, usr.role)}
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
                                  নিষ্ক্রিয়
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  সক্রিয়
                                </>
                              )}
                            </button>
                          ) : (
                            <Link
                              href="/admin?tab=requests"
                              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              আবেদন
                            </Link>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {showAddModal && canCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  নতুন সদস্য যোগ করুন
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
                  ইউজারনেম (স্থায়ী পরিচয়) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="ব্যবহারকারীর অনন্য ইউজারনেম লিখুন"
                  {...register("username")}
                  className={`text-xs h-9 font-mono ${errors.username ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {errors.username && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.username.message}</p>
                )}
              </div>


              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">পুরো নাম (ইংরেজি) <span className="text-red-500">*</span></label>
                <Input
                  type="text"
                  placeholder="ব্যবহারকারীর পূর্ণ ইংরেজি নাম লিখুন"
                  {...register("fullName")}
                  className={`text-xs h-9 ${errors.fullName ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.fullName.message}</p>
                )}
              </div>


              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইমেইল ঠিকানা (ঐচ্ছিক)
                </label>
                <Input
                  type="email"
                  placeholder="ব্যবহারকারীর কার্যকর ইমেইল লিখুন"
                  {...register("email")}
                  className={`text-xs h-9 ${errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email.message}</p>
                )}
              </div>


              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ফোন নম্বর (ঐচ্ছিক)
                </label>
                <Input
                  type="tel"
                  placeholder="ব্যবহারকারীর যোগাযোগ নম্বর লিখুন"
                  {...register("phone")}
                  className={`text-xs h-9 ${errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.phone.message}</p>
                )}
              </div>


              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  প্রাথমিক পাসওয়ার্ড <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="অ্যাকাউন্টের প্রারম্ভিক পাসওয়ার্ড লিখুন"
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


      {resetTargetUser && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  পাসওয়ার্ড পরিবর্তন
                </h3>
              </div>
              <button
                onClick={() => setResetTargetUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetStaffPasswordSubmit} className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
                <span className="text-slate-500">সদস্য: </span>
                <span className="font-bold text-slate-900 font-mono">
                  @{resetTargetUser.username}
                </span>
                {resetTargetUser.full_name && (
                  <span className="text-slate-600 font-medium ml-1">
                    ({resetTargetUser.full_name})
                  </span>
                )}
              </div>

              {resetError && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {resetError}
                </div>
              )}


              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  নতুন পাসওয়ার্ড <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showResetPassword ? "text" : "password"}
                    required
                    placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড লিখুন"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    disabled={isResetPending}
                    className="text-xs h-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>


              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span>
                </label>
                <Input
                  type={showResetPassword ? "text" : "password"}
                  required
                  placeholder="নতুন পাসওয়ার্ডটি নিশ্চিত করতে পুনরায় লিখুন"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  disabled={isResetPending}
                  className="text-xs h-9"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResetTargetUser(null)}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isResetPending}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {isResetPending ? "পরিবর্তন হচ্ছে..." : "সংরক্ষণ করুন"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}


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
