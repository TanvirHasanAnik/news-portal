"use client";

import React, { useState, useTransition } from "react";
import { UserPlus, Shield, UserX, UserCheck, X, Mail, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createUserAction,
  updateUserRoleAction,
  toggleUserStatusAction,
} from "@/actions/userActions";
import { ROLE_LABELS, ROLE_BADGE_STYLES, USER_ROLES } from "@/lib/auth";

export function UserManager({ initialUsers = [] }) {
  const [users, setUsers] = useState(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);

  // Add User Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(USER_ROLES.REPORTER);
  const [bio, setBio] = useState("");

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("role", role);
      formData.append("bio", bio);

      const res = await createUserAction(null, formData);
      if (res.success) {
        setUsers((prev) => [
          ...prev,
          {
            id: `usr_${Date.now()}`,
            name,
            email,
            role,
            status: "active",
            bio,
            created_at: new Date().toISOString(),
          },
        ]);
        setFeedback({ type: "success", message: res.message });
        setName("");
        setEmail("");
        setRole(USER_ROLES.REPORTER);
        setBio("");
        setShowAddModal(false);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleRoleChange = (userId, newRole) => {
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const handleToggleStatus = (userId, currentStatus, userName) => {
    const actionLabel = currentStatus === "active" ? "নিষ্ক্রিয়" : "পুনরায় সক্রিয়";
    if (!confirm(`আপনি কি "${userName}" কে ${actionLabel} করতে চান?`)) return;

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
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>×</button>
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">
          সক্রিয় সদস্য তালিকা ও অ্যাক্সেস রোল
        </p>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8.5 gap-1.5 cursor-pointer shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          নতুন সদস্য আমন্ত্রণ (Invite)
        </Button>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">সদস্যের তথ্য</th>
                <th className="py-3 px-4">পদবী ও ভূমিকা (Role)</th>
                <th className="py-3 px-4">অবস্থা (Status)</th>
                <th className="py-3 px-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((usr) => {
                const badgeStyle = ROLE_BADGE_STYLES[usr.role] || "bg-slate-100 text-slate-700";
                const isSuperAdmin = usr.role === USER_ROLES.SUPER_ADMIN;

                return (
                  <tr key={usr.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User profile with initials */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {usr.name ? usr.name.slice(0, 2) : "ইউ"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">
                            {usr.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            {usr.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role selector dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={usr.role}
                        disabled={isSuperAdmin || isPending}
                        onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                        className={`text-xs font-semibold rounded-md border px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer disabled:cursor-not-allowed ${badgeStyle}`}
                      >
                        {Object.entries(ROLE_LABELS).map(([rKey, rLabel]) => (
                          <option key={rKey} value={rKey}>
                            {rLabel}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {usr.status === "active" ? (
                        <Badge variant="success" className="gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          সক্রিয়
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          নিষ্ক্রিয়
                        </Badge>
                      )}
                    </td>

                    {/* Actions: Enable / Disable */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {!isSuperAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(usr.id, usr.status, usr.name)}
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
                        <span className="text-[11px] text-slate-400 font-medium">স্থায়ী অ্যাডমিন</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite / Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  নতুন সদস্য যোগ বা আমন্ত্রণ (Invite-by-Email)
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সদস্যের পুরো নাম
                </label>
                <Input
                  type="text"
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইমেইল ঠিকানা (আমন্ত্রণ প্রেরণের জন্য)
                </label>
                <Input
                  type="email"
                  placeholder="name@aloshbe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  দায়িত্ব ও পদবী (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {Object.entries(ROLE_LABELS).map(([rKey, rLabel]) => (
                    <option key={rKey} value={rKey}>
                      {rLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সংক্ষিপ্ত পরিচিতি বা নোট (ঐচ্ছিক)
                </label>
                <Input
                  type="text"
                  placeholder="নিজস্ব প্রতিবেদক / সিনিয়র রিপোর্টার"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="text-xs h-9"
                />
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
                  আমন্ত্রণ প্রেরণ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

