import React from "react";

export default function AdHolder({
  size = "300x250", 
  className = "",
  label = "বিজ্ঞাপন",
  title = "বিজ্ঞাপনের স্থান",
}) {
  const isLarge = size === "300x600";
  const aspectClass = isLarge ? "aspect-[300/600]" : "aspect-[300/250]";
  const dimensionText = isLarge ? "৩০০ × ৬০০ পিক্সেল" : "৩০০ × ২৫০ পিক্সেল";

  return (
    <div
      role="complementary"
      aria-label={`${label} ${dimensionText}`}
      className={`w-full max-w-[320px] ${aspectClass} bg-slate-100/90 rounded-xs flex flex-col items-center justify-center p-4 text-center border-dashed border-2 border-slate-300 relative group mx-auto transition-colors hover:border-slate-400 ${className}`}
    >
      <span className="absolute top-2 left-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none">
        {label}
      </span>
      <p className="text-slate-400 text-xs sm:text-sm font-medium">
        {title}
      </p>
      <p className="text-slate-400 text-[11px] mt-1 font-mono">
        {dimensionText}
      </p>
    </div>
  );
}

