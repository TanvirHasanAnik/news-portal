import React from "react";
import Link from "next/link";
import NewsImage from "@/components/NewsImage";

/**
 * ============================================================================
 * DUAL-LAYER IMAGE ASPECT RATIO ARCHITECTURE
 * ============================================================================
 *
 * Layer 1 (Ingestion): Built-in 16:9 Upload Cropper (Admin)
 * - All images uploaded to Cloudflare R2 are strictly locked to a 16:9 aspect ratio.
 * - Guarantees all master news images are uniform, high-resolution (1600x900 WebP),
 *   and keep the focal point centered within the rule-of-thirds safe area.
 *
 * Layer 2 (Presentation): Dynamic CSS-Driven Card Cropping (Frontend)
 * - That SINGLE 16:9 master image URL is consumed across all site cards.
 * - Tailwind CSS utilities (`object-cover` + `aspect-video`, `aspect-[4/3]`, `aspect-square`)
 *   instruct the browser to auto-fit and center-crop the image to any layout shape
 *   with ZERO distortion, stretching, or wasted network requests.
 */

/**
 * 1. LEAD / FLAGSHIP CARD (16:9 Aspect Ratio)
 * Uses `aspect-video` (16:9) to display the master image in its original composition.
 */
export function LeadHero16x9Card({ news }) {
  const { headline, summary, image, category, categorySlug, id, time } = news;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300">
      {/* 16:9 Master Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <Link href={`/article/${id}`} className="block w-full h-full">
          <NewsImage
            src={image}
            alt={headline}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>
        {category && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-sm">
            {category}
          </span>
        )}
        <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
          16:9 Master
        </span>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <h2 className="font-serif-bangla text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-red-700 leading-tight transition-colors">
            <Link href={`/article/${id}`}>{headline}</Link>
          </h2>
          {summary && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
        {time && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
            {time}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * 2. EDITORIAL / MAGAZINE CARD (4:3 Aspect Ratio)
 * Uses `aspect-[4/3]` with `object-cover`.
 * Automatically trims the lateral margins of the 16:9 master image while keeping
 * the subject centered. Ideal for horizontal media cards and compact column lists.
 */
export function Editorial4x3Card({ news }) {
  const { headline, summary, image, category, id, time } = news;

  return (
    <article className="group flex items-start gap-3.5 sm:gap-4 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
      {/* 4:3 Dynamic Crop Container */}
      <div className="relative aspect-[4/3] w-28 sm:w-36 md:w-44 shrink-0 overflow-hidden rounded-md bg-slate-100">
        <Link href={`/article/${id}`} className="block w-full h-full">
          <NewsImage
            src={image}
            alt={headline}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>
        <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1 py-0.5 rounded">
          4:3 Crop
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          {category && (
            <span className="text-xs font-semibold text-red-600 tracking-wide uppercase">
              {category}
            </span>
          )}
          <h3 className="font-serif-bangla text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-700 leading-snug line-clamp-2 mt-0.5 transition-colors">
            <Link href={`/article/${id}`}>{headline}</Link>
          </h3>
          {summary && (
            <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
        {time && (
          <span className="mt-2 text-[11px] text-slate-400 font-sans">
            {time}
          </span>
        )}
      </div>
    </article>
  );
}

/**
 * 3. COMPACT SQUARE CARD (1:1 Aspect Ratio)
 * Uses `aspect-square` with `object-cover`.
 * Symmetrically crops the 16:9 master image into a modern square thumbnail.
 * Perfect for mobile 2-column grids, sidebar trending widgets, and breaking tickers.
 */
export function Square1x1Card({ news }) {
  const { headline, image, category, id } = news;

  return (
    <article className="group flex flex-col bg-white rounded-lg overflow-hidden border border-slate-200 hover:shadow-xs transition-shadow">
      {/* 1:1 Square Crop Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <Link href={`/article/${id}`} className="block w-full h-full">
          <NewsImage
            src={image}
            alt={headline}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>
        {category && (
          <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            {category}
          </span>
        )}
        <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1 py-0.5 rounded">
          1:1 Square
        </span>
      </div>

      <div className="p-2.5 sm:p-3">
        <h4 className="font-serif-bangla text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-red-700 leading-snug line-clamp-2 transition-colors">
          <Link href={`/article/${id}`}>{headline}</Link>
        </h4>
      </div>
    </article>
  );
}

/**
 * 4. RESPONSIVE ADAPTIVE CARD (Dynamic Aspect Ratio Across Breakpoints)
 * Starts as `aspect-video` on mobile, shifts to `aspect-[4/3]` on tablets,
 * and expands back to `aspect-video` on desktop screens.
 */
export function ResponsiveAdaptiveCard({ news }) {
  const { headline, summary, image, id } = news;

  return (
    <article className="group flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-200 bg-white">
      {/* Breakpoint-adaptive aspect ratio: 16:9 on mobile, 4:3 on tablet/desktop */}
      <div className="relative aspect-video md:aspect-[4/3] md:w-56 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <Link href={`/article/${id}`} className="block w-full h-full">
          <NewsImage
            src={image}
            alt={headline}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
          Adaptive
        </span>
      </div>

      <div className="flex flex-col justify-center flex-1">
        <h3 className="font-serif-bangla text-lg sm:text-xl font-bold text-slate-900 group-hover:text-red-700 leading-snug">
          <Link href={`/article/${id}`}>{headline}</Link>
        </h3>
        {summary && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {summary}
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * 5. DUAL-LAYER STRATEGY VISUAL COMPARISON WIDGET
 * Side-by-side showcase displaying how a SINGLE 16:9 master image URL
 * perfectly renders in 16:9, 4:3, and 1:1 layouts with Tailwind CSS.
 */
export default function DualLayerShowcase({
  masterImageUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop",
  sampleHeadline = "ডুয়াল-লেয়ার ইমেজ স্ট্র্যাটেজি: ১৬:৯ মাস্টার ইমেজ থেকে বিভিন্ন কার্ড লেআউট",
}) {
  const mockNews = {
    id: "dual-layer-demo",
    headline: sampleHeadline,
    summary:
      "এডমিন প্যানেলে আপলোড করার সময় ছবিটি ১৬:৯ অনুপাতে ক্রপ করা হয়েছে। ফ্রন্টএন্ডে Tailwind CSS (object-cover) ব্যবহার করে স্বয়ংক্রিয়ভাবে বিভিন্ন অনুপাতে ফিট করানো হয়েছে।",
    image: masterImageUrl,
    category: "প্রযুক্তি",
    time: "এইমাত্র",
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-indigo-600 rounded-xs" />
          <h2 className="font-serif-bangla text-xl sm:text-2xl font-bold text-slate-900">
            ডুয়াল-লেয়ার অ্যাসপেক্ট রেশিও ডেমো (Dual-Layer Image Strategy)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          একটি মাত্র ১৬:৯ মাস্টার ইমেজ বিভিন্ন কার্ডে কীভাবে <code>aspect-video</code>,{" "}
          <code>aspect-[4/3]</code> এবং <code>aspect-square</code> হিসেবে ক্রপ হয়:
        </p>
      </div>

      {/* Grid of the 3 Aspect Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Layout 1: 16:9 Master */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>১. লিড কার্ড (16:9 Master)</span>
            <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              aspect-video
            </code>
          </div>
          <LeadHero16x9Card news={mockNews} />
        </div>

        {/* Layout 2: 4:3 Editorial */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>২. এডিটোরিয়াল কার্ড (4:3)</span>
            <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              aspect-[4/3]
            </code>
          </div>
          <Editorial4x3Card news={mockNews} />
        </div>

        {/* Layout 3: 1:1 Square */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>৩. স্কয়ার গ্রিড (1:1)</span>
            <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              aspect-square
            </code>
          </div>
          <Square1x1Card news={mockNews} />
        </div>
      </div>
    </div>
  );
}

