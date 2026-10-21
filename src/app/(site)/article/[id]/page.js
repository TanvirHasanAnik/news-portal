import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import NewsImage from "@/components/NewsImage";
import NewsCard from "@/components/NewsCard";
import AdHolder from "@/components/AdHolder";
import MostReadSection from "@/components/MostReadSection";
import SocialShareBar from "@/components/SocialShareBar";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import {
  getArticleById,
  getAllArticles,
  getRelatedArticles,
  getArticleContent,
  categoryAccentMap,
} from "@/utils/categoryNews";

/**
 * Prerenders all article routes at build time (Next.js Static Generation)
 * https://nextjs.org/docs/app/getting-started/linking-and-navigating#dynamic-segments-without-generatestaticparams
 */
export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    id: String(article.id),
  }));
}

/**
 * Dynamic metadata generation per article
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = getArticleById(id);

  if (!article) {
    return {
      title: "সংবাদ পাওয়া যায়নি | আলো আসবে",
    };
  }

  return {
    title: `${article.headline} | আলো আসবে`,
    description: article.summary,
  };
}

/**
 * Single Article Reading Page Component (Server Component / SSR)
 * Following Next.js App Router conventions:
 * https://nextjs.org/docs/app/getting-started/layouts-and-pages
 * https://nextjs.org/docs/app/getting-started/linking-and-navigating
 */
export default async function ArticlePage({ params }) {
  const { id } = await params;
  const article = getArticleById(id);

  if (!article) {
    notFound();
  }

  // Get accent badge color for the category
  const accentClass =
    categoryAccentMap[article.categorySlug] ||
    "from-slate-700 to-slate-900 bg-red-600 border-red-600 text-red-600";
  const badgeBg = accentClass.split(" ")[1] || "bg-red-600";

  // Detailed paragraphs for article body
  const paragraphs = getArticleContent(article);

  // Suggestions: "এই বিভাগের আরও খবর" (More news from the same category)
  const relatedArticles = getRelatedArticles(article.categorySlug, article.id, 4);

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 lg:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* 1. Header: Category & Subcategory on left, Social Share & Link Copy on right */}
        {/* Strictly no other info such as date, time, author etc. */}
        <header className="border-b-2 border-slate-200 pb-5 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category and Subcategory: Reused design from category page (refined compact size) */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <span className={`w-2 sm:w-2.5 h-5 sm:h-6 rounded-2xs ${badgeBg}`} />
              <Link
                href={`/category/${article.categorySlug}`}
                className="font-serif-bangla text-lg sm:text-xl lg:text-2xl font-bold text-slate-950 tracking-tight shrink-0 hover:text-red-700 transition-colors"
              >
                {article.category}
              </Link>

              {/* Subcategory placed on the right side of category name */}
              {article.subcategory && (
                <Link
                  href={`/category/${article.categorySlug}?sub=${encodeURIComponent(article.subcategory)}`}
                  className="font-serif-bangla text-sm sm:text-base lg:text-lg font-semibold text-red-600 shrink-0 hover:underline"
                >
                  / {article.subcategory}
                </Link>
              )}
            </div>

            {/* Most right side: Horizontal list of social media share & link copy button */}
            <div className="shrink-0 flex items-center">
              <SocialShareBar title={article.headline} />
            </div>
          </div>
        </header>

        {/* 2. Main 2:1 Column Ratio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">

          {/* Main content [First Column - Ratio 2]: Title, Image, Detailed Text and nothing else */}
          <main className="lg:col-span-2 space-y-6">
            {/* 2.1 Title */}
            <h1 className="font-serif-bangla text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-semi-bold text-slate-950 leading-tight">
              {article.headline}
            </h1>

            {/* 2.2 Image (rendered if image was uploaded, or if no video is present) */}
            {(article.hasCustomImage || !article.youtubeUrl) && (
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <NewsImage
                  src={article.image}
                  alt={article.headline}
                  imagePriority={true}
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* 2.3 Embedded YouTube Video (comes under image in the article page) */}
            {article.youtubeUrl && (
              <YouTubeEmbed
                url={article.youtubeUrl}
                title={article.headline}
              />
            )}

            {/* 2.4 Detailed text of the article and nothing else (omitted if no detailed text) */}
            {paragraphs.length > 0 && (
              <div className="font-serif-bangla text-lg sm:text-xl text-slate-800 leading-relaxed sm:leading-loose space-y-5 sm:space-y-6">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-justify sm:text-left">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </main>

          {/* Second Column [Ratio 1]: 2 Ad Holders + সর্বাধিক পঠিত Section */}
          <aside
            aria-label="বিজ্ঞাপন ও সর্বাধিক পঠিত"
            className="lg:col-span-1 space-y-6"
          >
            {/* 2 Ad Holders (reused from home page) */}
            <AdHolder size="300x250" />
            <AdHolder size="300x250" />

            {/* সর্বাধিক পঠিত section under the ad holders (reused from handpicked section of homepage) */}
            <MostReadSection />
          </aside>

        </div>

        {/* 3. At the most bottom: এই বিভাগের আরও খবর suggestion */}
        {relatedArticles.length > 0 && (
          <section
            aria-label="এই বিভাগের আরও খবর"
            className="pt-8 sm:pt-10 border-t-2 border-slate-900 mt-8 sm:mt-12"
          >
            {/* Section Header */}
            <div className="flex items-center gap-2.5 border-b-2 border-slate-900 pb-3 mb-6">
              <span className="w-2.5 h-6 bg-red-600 inline-block"></span>
              <h2 className="font-serif-bangla text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                এই বিভাগের আরও খবর
              </h2>
            </div>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-start">
              {relatedArticles.map((item) => (
                <NewsCard
                  key={item.id}
                  news={item}
                  variant="vertical"
                  imageAspect="aspect-[16/10]"
                  showCategory={false}
                  showSubcategory={false}
                  showSummary={true}
                  summaryClamp="line-clamp-2"
                  headlineTag="h3"
                  headlineSize="text-base sm:text-lg font-bold"
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

