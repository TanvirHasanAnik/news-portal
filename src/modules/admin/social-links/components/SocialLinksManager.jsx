"use client";

import React, { useState, useTransition } from "react";
import {
  FacebookIcon,
  TwitterXIcon,
  YoutubeIcon,
  InstagramIcon,
} from "@/components/SocialIcons";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import { saveSocialLinksAction } from "@/actions/socialLinksActions";
import { Check, AlertCircle, Loader2, ExternalLink, RefreshCw, Save } from "lucide-react";

export function SocialLinksManager({ initialLinks = {} }) {
  const [formData, setFormData] = useState({
    facebook: initialLinks?.facebook || "",
    youtube: initialLinks?.youtube || "",
    twitter: initialLinks?.twitter || "",
    instagram: initialLinks?.instagram || "",
  });

  const [savedData, setSavedData] = useState({
    facebook: initialLinks?.facebook || "",
    youtube: initialLinks?.youtube || "",
    twitter: initialLinks?.twitter || "",
    instagram: initialLinks?.instagram || "",
  });

  const [statusMessage, setStatusMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  const validateUrl = (url) => {
    if (!url || url.trim() === "") return true;
    try {
      const parsed = new URL(url.trim());
      return (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname);
    } catch {
      return false;
    }
  };

  const handleChange = (platform, value) => {
    setFormData((prev) => ({ ...prev, [platform]: value }));
    setStatusMessage(null);

    if (value.trim() !== "" && !validateUrl(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        [platform]: "সঠিক ও কার্যকর ওয়েব ঠিকানা লিখুন (যেমন: https://...)।",
      }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[platform];
        return next;
      });
    }
  };

  const handleReset = () => {
    setFormData({ ...savedData });
    setFieldErrors({});
    setStatusMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const errors = {};
    if (formData.facebook.trim() && !validateUrl(formData.facebook)) {
      errors.facebook = "ফেসবুক লিংকটি একটি সঠিক URL হতে হবে।";
    }
    if (formData.youtube.trim() && !validateUrl(formData.youtube)) {
      errors.youtube = "ইউটিউব লিংকটি একটি সঠিক URL হতে হবে।";
    }
    if (formData.twitter.trim() && !validateUrl(formData.twitter)) {
      errors.twitter = "টুইটার / এক্স লিংকটি একটি সঠিক URL হতে হবে।";
    }
    if (formData.instagram.trim() && !validateUrl(formData.instagram)) {
      errors.instagram = "ইনস্টাগ্রাম লিংকটি একটি সঠিক URL হতে হবে।";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatusMessage({
        type: "error",
        text: "ফর্মের কিছু লিংকে ত্রুটি রয়েছে। অনুগ্রহ করে সঠিক URL প্রদান করুন।",
      });
      return;
    }

    startTransition(async () => {
      const res = await saveSocialLinksAction(null, formData);
      if (res?.success) {
        setSavedData({ ...formData });
        setStatusMessage({
          type: "success",
          text: res.message || "লিংক সফলভাবে সংরক্ষণ করা হয়েছে।",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res?.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে।",
        });
      }
    });
  };

  const inputFields = [
    {
      id: "facebook",
      name: "ফেসবুক পেজ / প্রোফাইল লিংক",
      icon: FacebookIcon,
      iconColor: "bg-[#1877F2] text-white",
      placeholder: "https://facebook.com/yourpage",
      value: formData.facebook,
    },
    {
      id: "youtube",
      name: "ইউটিউব চ্যানেল লিংক",
      icon: YoutubeIcon,
      iconColor: "bg-[#FF0000] text-white",
      placeholder: "https://youtube.com/@yourchannel",
      value: formData.youtube,
    },
    {
      id: "twitter",
      name: "টুইটার / এক্স প্রোফাইল লিংক",
      icon: TwitterXIcon,
      iconColor: "bg-slate-900 text-white",
      placeholder: "https://x.com/yourhandle",
      value: formData.twitter,
    },
    {
      id: "instagram",
      name: "ইনস্টাগ্রাম হ্যান্ডেল লিংক",
      icon: InstagramIcon,
      iconColor: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white",
      placeholder: "https://instagram.com/yourhandle",
      value: formData.instagram,
    },
  ];

  const hasChanges =
    formData.facebook !== savedData.facebook ||
    formData.youtube !== savedData.youtube ||
    formData.twitter !== savedData.twitter ||
    formData.instagram !== savedData.instagram;

  return (
    <div className="space-y-8">
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="text-sm font-medium">{statusMessage.text}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">
                সোশ্যাল মিডিয়া হ্যান্ডেল ও ইউআরএল
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                প্রতিটি প্ল্যাটফর্মের সঠিক ওয়েব ঠিকানা লিখুন। লিংক না দিতে চাইলে ঘরটি খালি রাখুন।
              </p>
            </div>

            <div className="p-6 space-y-6">
              {inputFields.map((field) => {
                const IconComponent = field.icon;
                const error = fieldErrors[field.id];
                const isConfigured = Boolean(field.value && field.value.trim() && !error);

                return (
                  <div key={field.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={field.id}
                        className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${field.iconColor}`}>
                          <IconComponent className="w-3 h-3" />
                        </span>
                        <span>{field.name}</span>
                      </label>

                      {isConfigured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          সংযুক্ত
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                          খালি
                        </span>
                      )}
                    </div>

                    <div className="relative rounded-lg shadow-2xs">
                      <input
                        id={field.id}
                        name={field.id}
                        type="text"
                        value={field.value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={isPending}
                        className={`block w-full rounded-lg px-3.5 py-2.5 text-sm transition-colors border ${
                          error
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        } text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500`}
                      />

                      {field.value && isConfigured && (
                        <a
                          href={field.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="লিংকটি নতুন ট্যাবে খুলুন"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {error ? (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        {field.placeholder} ফরম্যাটে সঠিক লিংক প্রদান করুন।
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                বাতিল করুন
              </button>

              <button
                type="submit"
                disabled={isPending || Object.keys(fieldErrors).length > 0}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    সংরক্ষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    পরিবর্তন সংরক্ষণ করুন
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              লাইভ প্রিভিউ (ওয়েবসাইট প্রদর্শন)
            </h3>
            <p className="text-xs text-slate-500 mt-2 mb-4">
              পাঠকরা সাইটের হেডার ও ফুটারে যেভাবে এই আইকনগুলো দেখতে পাবেন:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  হেডার প্রিভিউ
                </span>
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-center">
                  <SocialMediaLinks links={formData} variant="header" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  ফুটার প্রিভিউ
                </span>
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-center">
                  <SocialMediaLinks links={formData} variant="footer" />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-900">
              <span className="font-semibold block mb-0.5">লক্ষ্য করুন:</span>
              যেসব প্ল্যাটফর্মের ঘর খালি রাখা হবে, ওয়েবসাইটে তাদের আইকনে ক্লিক করলে কোনো পৃষ্ঠা ওপেন হবে না।
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

