"use client";

import { loginAction } from "@/actions/authActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnFrom = searchParams ? searchParams.get("from") : null;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("অনুগ্রহ করে ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", username.trim());
      formData.append("password", password);

      const res = await loginAction(null, formData);
      if (res.success) {
        const isSafeDestination =
          returnFrom &&
          returnFrom.startsWith("/admin") &&
          !returnFrom.startsWith("/admin/login");
        const destination = isSafeDestination ? returnFrom : "/admin";
        window.location.href = destination;
      } else {
        setErrorMessage(res.message || "লগইন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100">
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
          <span className="shrink-0 mt-0.5 font-bold">✕</span>
          <p className="flex-1">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            ইউজারনেম (Username) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="আপনার নিবন্ধিত ইউজারনেম লিখুন"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isPending}
              className="pl-9 text-xs h-10 border-slate-200 focus-visible:ring-slate-900 bg-slate-50/50"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              পাসওয়ার্ড <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type={showPassword ? "text" : "password"}
              required
              placeholder="আপনার পাসওয়ার্ড লিখুন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              className="pl-9 pr-10 text-xs h-10 border-slate-200 focus-visible:ring-slate-900 bg-slate-50/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-10 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white gap-2 cursor-pointer shadow-sm mt-2"
        >
          <LogIn className="w-4 h-4" />
          {isPending ? "লগইন হচ্ছে..." : "প্রবেশ করুন"}
        </Button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-slate-700 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200"
          >

            <img
              src="/brand-logo.svg"
              alt="আমাদের সংবাদ"
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full w-fit mx-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>নিরাপদ অ্যাডমিন কন্ট্রোল প্যানেল</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-3 tracking-tight">
            অ্যাডমিন প্যানেলে প্রবেশ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            আলো আসবে সংবাদ ব্যবস্থাপনা পোর্টালে আপনার অ্যাকাউন্টে লগইন করুন
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-100 flex items-center justify-center min-h-[250px]">
              <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>মূল ওয়েবসাইটে ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
