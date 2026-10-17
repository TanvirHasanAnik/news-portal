"use client";

import React, { useState } from "react";
import { Link2, Check } from "lucide-react";
import {
  FacebookIcon,
  TwitterXIcon,
  LinkedinIcon,
} from "./SocialIcons";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.97.57 3.805 1.564 5.358L2.07 22l4.742-1.467a10.003 10.003 0 0 0 5.219 1.498h.005c5.536 0 10.03-4.495 10.03-10.031C22.066 6.495 17.572 2 12.031 2zm5.875 14.218c-.244.686-1.42 1.31-1.956 1.393-.518.08-1.196.115-1.936-.123-.473-.152-1.085-.353-1.873-.695-3.303-1.433-5.46-4.786-5.626-5.006-.164-.22-1.341-1.785-1.341-3.404 0-1.619.849-2.415 1.15-2.744.303-.33.66-.413.88-.413.22 0 .44.002.633.011.206.01.482-.078.754.575.28.672.955 2.33.104 2.525.088.196.147.424.015.688-.132.264-.2.428-.396.658-.198.23-.416.513-.594.689-.198.196-.405.41-.174.806.23.396 1.026 1.693 2.2 2.74 1.51 1.345 2.782 1.763 3.178 1.96.396.198.627.165.858-.1.232-.264.99-1.155 1.254-1.551.264-.396.528-.33.88-.198.352.132 2.235 1.054 2.62 1.246.385.193.64.286.734.44.093.155.093.896-.151 1.582z" />
    </svg>
  );
}

/**
 * Reusable SocialShareBar Component
 * 
 * Provides social sharing (Facebook, X/Twitter, WhatsApp, LinkedIn)
 * and a link copy button with visual confirmation.
 */
export default function SocialShareBar({
  title = "",
  url = "",
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const handleShare = (platform) => {
    const currentUrl = getShareUrl();
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(title || "সংবাদ | আলো আসবে");

    let shareLink = "";
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "whatsapp":
        shareLink = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        break;
    }

    if (shareLink && typeof window !== "undefined") {
      window.open(shareLink, "_blank", "noopener,noreferrer,width=600,height=500");
    }
  };

  const handleCopyLink = () => {
    const currentUrl = getShareUrl();
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      role="region"
      aria-label="সামাজিক যোগাযোগ মাধ্যম ও শেয়ার অপশন"
      className={`flex items-center gap-1.5 sm:gap-2 flex-wrap ${className}`}
    >
      {/* Facebook */}
      <button
        type="button"
        onClick={() => handleShare("facebook")}
        title="ফেসবুকে শেয়ার করুন"
        aria-label="ফেসবুকে শেয়ার করুন"
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-none bg-slate-100 hover:bg-[#1877F2] text-slate-700 hover:text-white transition-colors cursor-pointer select-none"
      >
        <FacebookIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </button>

      {/* X (Twitter) */}
      <button
        type="button"
        onClick={() => handleShare("twitter")}
        title="এক্স (টুইটার)-এ শেয়ার করুন"
        aria-label="এক্স (টুইটার)-এ শেয়ার করুন"
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-none bg-slate-100 hover:bg-black text-slate-700 hover:text-white transition-colors cursor-pointer select-none"
      >
        <TwitterXIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* WhatsApp */}
      <button
        type="button"
        onClick={() => handleShare("whatsapp")}
        title="হোয়াটসঅ্যাপে শেয়ার করুন"
        aria-label="হোয়াটসঅ্যাপে শেয়ার করুন"
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-none bg-slate-100 hover:bg-[#25D366] text-slate-700 hover:text-white transition-colors cursor-pointer select-none"
      >
        <WhatsAppIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </button>

      {/* LinkedIn */}
      <button
        type="button"
        onClick={() => handleShare("linkedin")}
        title="লিংকডইন-এ শেয়ার করুন"
        aria-label="লিংকডইন-এ শেয়ার করুন"
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-none bg-slate-100 hover:bg-[#0A66C2] text-slate-700 hover:text-white transition-colors cursor-pointer select-none"
      >
        <LinkedinIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </button>

      {/* Copy Link Button */}
      <div className="relative">
        <button
          type="button"
          onClick={handleCopyLink}
          title={copied ? "লিংক কপি হয়েছে!" : "লিংক কপি করুন"}
          aria-label={copied ? "লিংক কপি হয়েছে!" : "লিংক কপি করুন"}
          className={`h-8 sm:h-9 px-2.5 sm:px-3 flex items-center gap-1.5 rounded-none text-xs sm:text-sm font-serif-bangla font-semibold transition-colors cursor-pointer select-none ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 hover:bg-slate-200 text-slate-800"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>কপি হয়েছে</span>
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">কপি লিংক</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

