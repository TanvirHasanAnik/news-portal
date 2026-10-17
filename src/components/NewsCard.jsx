import React from "react";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import NewsImage from "./NewsImage";
import ArticleActions from "./ArticleActions";
import { DEFAULT_NEWS_IMAGE, getNewsImageUrl, getOptimizedNewsImage } from "../utils/imageUtils";

/**
 * Reusable NewsCard Component
 * 
 * Supports multiple editorial layouts via the `variant` prop:
 * - 'vertical': Classic editorial card (Image on top, headline, summary below).
 * - 'horizontal': Media object card (Side-by-side thumbnail and content).
 * - 'hero': Lead / flagship story card (Spacious split view on desktop).
 * - 'compact': Minimalist image + headline card (Ideal for multi-column grids).
 * - 'row-summary': Hybrid card (Row 1: thumbnail + headline, Row 2: full summary).
 * - 'emphasized': Featured visual card with badge overlays and action buttons.
 */
export default function NewsCard({
  news,
  variant = "vertical",
  href,
  imageSrc,
  imageAspect,
  imageWrapperClassName = "",
  imageClassName = "",
  imagePriority = false,
  loading,
  headlineTag,
  headlineSize,
  headlineClamp = "line-clamp-2",
  headlineColor = "text-slate-900",
  headlineHoverColor,
  headlineClassName = "",
  showSummary = true,
  summaryClamp = "line-clamp-2",
  summarySize,
  summaryClassName = "",
  showCategory = false,
  categoryPlacement = "badge", // "badge" | "bottom"
  showSubcategory = false,
  showTime = false,
  showAuthor = false,
  showLocation = false,
  reverseOrder = false,
  contentWrapperClassName = "",
  className = "",
  children,
}) {
  if (!news) return null;

  const {
    id,
    headline,
    image,
    summary,
    category,
    categorySlug,
    subcategory,
    publishedAt,
    time,
    author,
    location,
    isMostRecent,
  } = news;

  const linkHref = href || `#news-${id}`;
  const targetImage = imageSrc || image;
  const finalImageSrc = targetImage
    ? (imageSrc ? getNewsImageUrl(imageSrc) : getOptimizedNewsImage(image))
    : DEFAULT_NEWS_IMAGE;
  const imageLoading = loading || (imagePriority ? "eager" : "lazy");

  // Determine semantic heading tag
  const HeadingTag =
    headlineTag ||
    (variant === "hero" ? "h2" : variant === "horizontal" ? "h4" : "h3");

  // =========================================================================
  // 1. EMPHASIZED VARIANT (Hero visual card with badges & interactive actions)
  // =========================================================================
  if (variant === "emphasized") {
    return (
      <article
        className={`group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      >
        {/* Featured Image */}
        <div
          className={`relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-100 ${
            imageAspect || ""
          } ${imageWrapperClassName}`}
        >
          <a href={linkHref} className="block w-full h-full">
            <NewsImage
              src={finalImageSrc}
              alt={headline}
              loading={imageLoading}
              decoding="async"
              className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${imageClassName}`}
            />
          </a>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 items-center z-10">
            {showCategory && category && (
              categorySlug ? (
                <Link
                  href={`/category/${categorySlug}`}
                  className="inline-block rounded bg-red-600 hover:bg-red-700 px-2.5 py-1 text-xs font-semibold text-white shadow-sm tracking-wide transition-colors"
                >
                  {category}
                </Link>
              ) : (
                <span className="inline-block rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm tracking-wide">
                  {category}
                </span>
              )
            )}
            {showSubcategory && subcategory && (
              categorySlug ? (
                <Link
                  href={`/category/${categorySlug}?sub=${encodeURIComponent(subcategory)}`}
                  className="inline-block rounded bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xs px-2 py-0.5 text-[11px] font-medium text-white shadow-sm transition-colors"
                >
                  {subcategory}
                </Link>
              ) : (
                <span className="inline-block rounded bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[11px] font-medium text-white shadow-sm">
                  {subcategory}
                </span>
              )
            )}
            {isMostRecent && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/95 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-slate-900 shadow-sm animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                এইমাত্র প্রকাশিত
              </span>
            )}
          </div>

          {/* Interactive actions (Bookmark & Share) */}
          <div className="absolute top-3 right-3 z-10">
            <ArticleActions />
          </div>
        </div>

        {/* Content Body */}
        <div className={`p-4 sm:p-5 flex flex-col flex-1 justify-between ${contentWrapperClassName}`}>
          <div>
            <HeadingTag
              className={`font-serif-bangla font-bold text-slate-900 leading-snug group-hover:text-red-700 transition-colors mb-2.5 ${
                headlineClamp || "line-clamp-2"
              } ${headlineSize || "text-lg sm:text-xl md:text-2xl"} ${headlineClassName}`}
            >
              <a href={linkHref} className="focus:outline-none focus:underline">
                {headline}
              </a>
            </HeadingTag>

            {showSummary && summary && (
              <p
                className={`text-slate-600 leading-relaxed mb-4 font-normal ${
                  summaryClamp || "line-clamp-3"
                } ${summarySize || "text-sm sm:text-base"} ${summaryClassName}`}
              >
                {summary}
              </p>
            )}
          </div>

          {/* Metadata Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2 flex-wrap">
              {author && (
                <span className="font-medium text-slate-700">{author}</span>
              )}
              {location && (
                <span className="flex items-center gap-0.5 text-slate-400">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {location}
                </span>
              )}
            </div>

            {showTime && (publishedAt || time) && (
              <div className="flex items-center gap-1 font-medium text-slate-500 shrink-0">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>{publishedAt || time}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  // =========================================================================
  // 2. HERO / LEAD STORY VARIANT (Desktop horizontal split / mobile stack)
  // =========================================================================
  if (variant === "hero") {
    const isGridLayout = className.includes("grid");
    return (
      <article
        className={`group bg-transparent ${
          isGridLayout ? "" : "flex flex-col md:flex-row items-stretch gap-5 lg:gap-6"
        } ${className}`}
      >
        {/* Featured Image */}
        <div
          className={`${
            isGridLayout ? "md:col-span-7 relative" : "w-full md:w-1/2 lg:w-7/12 shrink-0"
          } overflow-hidden bg-slate-100 ${
            imageAspect || ""
          } ${imageWrapperClassName}`}
        >
          <a href={linkHref} className="block w-full h-full">
            <NewsImage
              src={finalImageSrc}
              alt={headline}
              loading={imageLoading}
              decoding="async"
              className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${imageClassName}`}
            />
          </a>
        </div>

        {/* Content Area */}
        <div
          className={`${
            isGridLayout ? "md:col-span-5 flex flex-col justify-start" : "flex flex-col justify-center flex-1 py-1 md:py-2"
          } ${contentWrapperClassName}`}
        >
          <HeadingTag
            className={`font-serif-bangla font-bold text-slate-900 leading-snug ${
              headlineHoverColor || "group-hover:text-red-600"
            } transition-colors ${
              headlineClamp || ""
            } ${headlineSize || "text-2xl sm:text-3xl lg:text-[28px] xl:text-3xl"} ${headlineClassName}`}
          >
            <a href={linkHref}>{headline}</a>
          </HeadingTag>

          {showSummary && summary && (
            <p
              className={`text-slate-600 leading-relaxed font-normal ${
                summaryClamp || "line-clamp-4"
              } ${summarySize || "text-sm sm:text-base mt-3 sm:mt-3.5"} ${summaryClassName}`}
            >
              {summary}
            </p>
          )}

          {children}
        </div>
      </article>
    );
  }

  // =========================================================================
  // 3. HORIZONTAL VARIANT (Side-by-side thumbnail & headline, e.g. Most Read)
  // =========================================================================
  if (variant === "horizontal") {
    const hasCustomAlignment = className.includes("items-");
    return (
      <article
        className={`group flex flex-row gap-3 sm:gap-3.5 ${
          hasCustomAlignment ? "" : "items-start"
        } ${className}`}
      >
        {/* Left Side Thumbnail */}
        <div
          className={`shrink-0 overflow-hidden bg-slate-100 ${
            imageAspect || ""
          } ${imageWrapperClassName || "w-24 h-16 sm:w-28 sm:h-18"}`}
        >
          <a href={linkHref} className="block w-full h-full">
            <NewsImage
              src={finalImageSrc}
              alt={headline}
              loading={imageLoading}
              decoding="async"
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imageClassName}`}
            />
          </a>
        </div>

        {/* Right Side Content */}
        <div
          className={`flex flex-col ${
            contentWrapperClassName.includes("justify-") ? "" : "justify-between"
          } flex-1 min-w-0 h-full py-0.5 ${contentWrapperClassName}`}
        >
          <HeadingTag
            className={`font-serif-bangla font-bold ${headlineColor} leading-snug ${
              headlineHoverColor || "group-hover:text-red-600"
            } transition-colors ${
              headlineClamp || "line-clamp-2"
            } ${headlineSize || "text-sm sm:text-[15px]"} ${headlineClassName}`}
          >
            <a href={linkHref}>{headline}</a>
          </HeadingTag>

          {showSummary && summary && (
            <p
              className={`text-slate-600 leading-relaxed font-normal ${
                summaryClamp || "line-clamp-2"
              } ${summarySize || "text-xs sm:text-[13px] mt-1.5"} ${summaryClassName}`}
            >
              {summary}
            </p>
          )}

          {/* Category link at bottom (Prothom Alo style for most read news) */}
          {showCategory && category && categoryPlacement === "bottom" && (
            <div className="mt-1.5 flex items-center">
              {categorySlug ? (
                <Link
                  href={`/category/${categorySlug}`}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  {category}
                </Link>
              ) : (
                <span className="text-xs font-semibold text-red-600">
                  {category}
                </span>
              )}
            </div>
          )}

          {showTime && (publishedAt || time) && (
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3 text-red-600" />
              <span>{publishedAt || time}</span>
            </div>
          )}

          {children}
        </div>
      </article>
    );
  }

  // =========================================================================
  // 4. ROW-SUMMARY VARIANT (Image left + headline right, summary below)
  // =========================================================================
  if (variant === "row-summary") {
    return (
      <article
        className={`group flex flex-col justify-between ${className}`}
      >
        <div>
          {/* First row: image on left, headline on right */}
          <div className="flex flex-row gap-3 items-start">
            <div
              className={`shrink-0 overflow-hidden bg-slate-100 ${
                imageAspect || ""
              } ${imageWrapperClassName || "w-24 h-16 sm:w-26 sm:h-18 md:w-20 md:h-16 lg:w-24 lg:h-18"}`}
            >
              <a href={linkHref} className="block w-full h-full">
                <NewsImage
                  src={finalImageSrc}
                  alt={headline}
                  loading={imageLoading}
                  decoding="async"
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imageClassName}`}
                />
              </a>
            </div>

            <HeadingTag
              className={`font-serif-bangla font-bold ${headlineColor} leading-snug ${
                headlineHoverColor || "group-hover:text-red-600"
              } transition-colors flex-1 min-w-0 ${
                headlineClamp || "line-clamp-2"
              } ${headlineSize || "text-sm lg:text-[15px]"} ${headlineClassName}`}
            >
              <a href={linkHref}>{headline}</a>
            </HeadingTag>
          </div>

          {/* Second row: full summary */}
          {showSummary && summary && (
            <p
              className={`text-slate-600 leading-relaxed font-normal ${
                summaryClamp || "line-clamp-2"
              } ${summarySize || "text-xs sm:text-[13px] mt-2"} ${summaryClassName}`}
            >
              {summary}
            </p>
          )}
        </div>

        {children}
      </article>
    );
  }

  // =========================================================================
  // 5. COMPACT VARIANT (Minimal image + headline, e.g. square mobile grids)
  // =========================================================================
  if (variant === "compact") {
    return (
      <article className={`group flex flex-col ${className}`}>
        {/* Image */}
        <div
          className={`w-full overflow-hidden bg-slate-100 ${
            imageAspect || "aspect-square"
          } ${imageWrapperClassName}`}
        >
          <a href={linkHref} className="block w-full h-full">
            <NewsImage
              src={finalImageSrc}
              alt={headline}
              loading={imageLoading}
              decoding="async"
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imageClassName}`}
            />
          </a>
        </div>

        {/* Headline */}
        <HeadingTag
          className={`font-serif-bangla font-bold ${headlineColor} leading-snug ${
            headlineHoverColor || "group-hover:text-red-600"
          } transition-colors ${
            headlineClamp || "line-clamp-2"
          } ${headlineSize || "text-xs sm:text-sm mt-2"} ${headlineClassName}`}
        >
          <a href={linkHref}>{headline}</a>
        </HeadingTag>

        {children}
      </article>
    );
  }

  // =========================================================================
  // 6. VERTICAL VARIANT (Standard Editorial: Image on top, headline, summary)
  // =========================================================================
  const imageElement = (
    <div
      className={`relative w-full overflow-hidden bg-slate-100 ${
        imageAspect || "aspect-[16/9]"
      } ${imageWrapperClassName}`}
    >
      <a href={linkHref} className="block w-full h-full">
        <NewsImage
          src={finalImageSrc}
          alt={headline}
          loading={imageLoading}
          decoding="async"
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${imageClassName}`}
        />
      </a>
      {showSubcategory && subcategory && (
        <span className="absolute bottom-2 left-2 rounded bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[11px] font-medium text-white shadow-sm pointer-events-none">
          {subcategory}
        </span>
      )}
    </div>
  );

  const headlineElement = (
    <HeadingTag
      className={`font-serif-bangla font-bold ${headlineColor} leading-snug ${
        headlineHoverColor || "group-hover:text-red-600"
      } transition-colors ${
        headlineClamp || "line-clamp-2"
      } ${headlineSize || "text-base sm:text-lg lg:text-xl mt-2.5"} ${headlineClassName}`}
    >
      <a href={linkHref}>{headline}</a>
    </HeadingTag>
  );

  const summaryElement = showSummary && summary && (
    <p
      className={`text-slate-600 leading-relaxed font-normal ${
        summaryClamp || "line-clamp-2"
      } ${summarySize || "text-xs sm:text-sm mt-1.5"} ${summaryClassName}`}
    >
      {summary}
    </p>
  );

  return (
    <article className={`group flex flex-col justify-between ${className}`}>
      {reverseOrder ? (
        <>
          {headlineElement}
          {imageElement}
          {summaryElement}
        </>
      ) : (
        <>
          <div>
            {imageElement}
            {headlineElement}
            {summaryElement}
          </div>
        </>
      )}

      {children}
    </article>
  );
}

/**
 * Convenience Subcomponents / Named Exports
 */
export function VerticalNewsCard(props) {
  return <NewsCard variant="vertical" {...props} />;
}

export function HorizontalNewsCard(props) {
  return <NewsCard variant="horizontal" {...props} />;
}

export function HeroNewsCard(props) {
  return <NewsCard variant="hero" {...props} />;
}

export function CompactNewsCard(props) {
  return <NewsCard variant="compact" {...props} />;
}

export function RowSummaryNewsCard(props) {
  return <NewsCard variant="row-summary" {...props} />;
}

export function EmphasizedNewsCard(props) {
  return <NewsCard variant="emphasized" {...props} />;
}
