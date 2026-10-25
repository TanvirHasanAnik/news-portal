"use client";

import React, { useState, useTransition } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getRoleName, getRoleBadgeClass } from "@/config/roles";
import {
  updateProfileAction,
  changeAdminPasswordAction,
} from "@/actions/authActions";

export function ProfileForm({ user }) {
  // Personal Info Form State
  const [fullName, setFullName] = useState(user?.fullName || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");

  const [profileMessage, setProfileMessage] = useState(null);
  const [isProfilePending, startProfileTransition] = useTransition();

  // Password Change Form State (Super Admin & Admin only)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState(null);
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const isSuperOrAdmin = user?.role === "super_admin" || user?.role === "admin";

  // Handle Profile Update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileMessage(null);

    startProfileTransition(async () => {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("bio", bio);

      const res = await updateProfileAction(null, formData);
      if (res.success) {
        setProfileMessage({ type: "success", text: res.message });
      } else {
        setProfileMessage({ type: "error", text: res.message });
      }
    });
  };

  // Handle Password Change (Admin/SuperAdmin)
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।",
      });
      return;
    }

    startPasswordTransition(async () => {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await changeAdminPasswordAction(null, formData);
      if (res.success) {
        setPasswordMessage({ type: "success", text: res.message });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: res.message });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Profile Header Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl uppercase shadow-xs shrink-0">
            {user?.username ? user.username.charAt(0) : "U"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {user?.fullName || user?.name || user?.username}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-mono">
                @{user?.username}
              </span>
              <span className="text-slate-300">•</span>
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${getRoleBadgeClass(
                  user?.role
                )}`}
              >
                {getRoleName(user?.role)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Personal Details Card */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              ব্যক্তিগত তথ্য পরিচালনা
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              আপনার নাম, যোগাযোগ ইমেইল এবং ফোন নম্বর হালনাগাদ করুন
            </p>
          </div>

          {profileMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                profileMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {profileMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Immutable Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ইউজারনেম (স্থায়ী পরিচয়)
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={user?.username || ""}
                  disabled
                  className="bg-slate-100 text-slate-600 font-mono text-xs cursor-not-allowed border-slate-200 pr-9"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                ইউজারনেম অপরিবর্তনযোগ্য মূল পরিচয় হিসেবে সংরক্ষিত।
              </p>
            </div>

            {/* Role (Read only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                দায়িত্ব / ভূমিকা
              </label>
              <Input
                type="text"
                value={getRoleName(user?.role)}
                disabled
                className="bg-slate-100 text-slate-600 text-xs cursor-not-allowed border-slate-200"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পুরো নাম
              </label>
              <Input
                type="text"
                placeholder="আপনার পুরো নাম লিখুন"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isProfilePending}
                className="text-xs h-9 border-slate-200 focus-visible:ring-slate-900"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                যোগাযোগের ইমেইল
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProfilePending}
                  className="pl-9 text-xs h-9 border-slate-200 focus-visible:ring-slate-900"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ফোন নম্বর
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="tel"
                  placeholder="০১৭xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isProfilePending}
                  className="pl-9 text-xs h-9 border-slate-200 focus-visible:ring-slate-900"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সংক্ষিপ্ত পরিচিতি (বায়ো)
              </label>
              <Textarea
                rows={3}
                placeholder="নিজের সম্পর্কে সংক্ষিপ্ত পরিচিতি..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isProfilePending}
                className="text-xs border-slate-200 focus-visible:ring-slate-900"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isProfilePending}
                className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer px-5"
              >
                {isProfilePending ? "সংরক্ষণ হচ্ছে..." : "তথ্য সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </div>

        {/* Security & Password Card */}
        <div className="lg:col-span-5 space-y-6">
          {isSuperOrAdmin ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  পাসওয়ার্ড পরিবর্তন
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  নিরাপত্তার স্বার্থে বর্তমান পাসওয়ার্ড যাচাই আবশ্যক
                </p>
              </div>

              {passwordMessage && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বর্তমান পাসওয়ার্ড <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showCurrentPass ? "text" : "password"}
                      required
                      placeholder="বর্তমান পাসওয়ার্ড দিন"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isPasswordPending}
                      className="text-xs h-9 pr-9 border-slate-200 focus-visible:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    নতুন পাসওয়ার্ড <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPass ? "text" : "password"}
                      required
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isPasswordPending}
                      className="text-xs h-9 pr-9 border-slate-200 focus-visible:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    নতুন পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPass ? "text" : "password"}
                      required
                      placeholder="পুনরায় নতুন পাসওয়ার্ড দিন"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isPasswordPending}
                      className="text-xs h-9 pr-9 border-slate-200 focus-visible:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPasswordPending}
                  className="w-full text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer h-9 mt-1"
                >
                  {isPasswordPending ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-slate-500" />
                <span>নিরাপত্তা নীতি</span>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2">
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  সংবাদপোর্টালের নিরাপত্তা নির্দেশিকা অনুযায়ী সাধারণ সম্পাদকীয় ও রিপোর্টার সদস্যদের পাসওয়ার্ড নিজস্ব প্রোফাইল থেকে পরিবর্তনের সুযোগ নেই।
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  আপনার পাসওয়ার্ড পরিবর্তন বা রিসেট করার প্রয়োজন হলে অনুগ্রহ করে সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

