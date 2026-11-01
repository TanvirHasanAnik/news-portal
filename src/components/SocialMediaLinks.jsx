"use client";

import React from "react";
import {
  FacebookIcon,
  TwitterXIcon,
  YoutubeIcon,
  InstagramIcon,
} from "./SocialIcons";

export default function SocialMediaLinks({
  links = {},
  variant = "header",
  className = "",
}) {
  const platforms = [
    {
      id: "facebook",
      name: "Facebook",
      icon: FacebookIcon,
      url: links?.facebook?.trim() || "",
      headerStyle: "bg-[#1877F2] text-white hover:bg-[#166fe5]",
    },
    {
      id: "twitter",
      name: "Twitter / X",
      icon: TwitterXIcon,
      url: links?.twitter?.trim() || "",
      headerStyle: "bg-slate-900 text-white hover:bg-black",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: YoutubeIcon,
      url: links?.youtube?.trim() || "",
      headerStyle: "bg-[#FF0000] text-white hover:bg-[#e60000]",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: InstagramIcon,
      url: links?.instagram?.trim() || "",
      headerStyle: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90",
    },
  ];

  const isHeader = variant === "header";
  const defaultContainerClass = isHeader
    ? "flex items-center gap-2"
    : "flex items-center gap-2 text-slate-500";

  return (
    <div className={className ? `${defaultContainerClass} ${className}` : defaultContainerClass}>
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const hasUrl = Boolean(platform.url);

        const buttonStyle = isHeader
          ? `w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs ${platform.headerStyle} ${
              hasUrl ? "hover:scale-110 cursor-pointer" : "cursor-default"
            }`
          : `p-2 rounded-full bg-slate-100 text-slate-600 transition-colors border border-slate-200 flex items-center justify-center ${
              hasUrl ? "hover:bg-red-600 hover:text-white cursor-pointer" : "cursor-default"
            }`;

        const iconClass = isHeader ? "w-3.5 h-3.5" : "w-4 h-4";

        if (hasUrl) {
          return (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={platform.name}
              title={platform.name}
              className={buttonStyle}
            >
              <Icon className={iconClass} />
            </a>
          );
        }

        return (
          <button
            key={platform.id}
            type="button"
            aria-label={platform.name}
            title={platform.name}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={buttonStyle}
          >
            <Icon className={iconClass} />
          </button>
        );
      })}
    </div>
  );
}

