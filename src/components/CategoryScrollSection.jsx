import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import NewsCard from "./NewsCard";
import { categories, categoryNewsData } from "../data/newsData";



export default function CategoryScrollSection({ dbArticles = [], categories: propCategories = [] }) {

  const baseCategories =
    Array.isArray(propCategories) && propCategories.length > 0
      ? propCategories.filter((c) => !c.is_permanent && c.slug !== "latest" && c.slug !== "handpicked")
      : categories.filter((c) => categoryNewsData && categoryNewsData[c.slug]);


  const displayCategories = baseCategories.filter((cat) => {
    const hasStatic = categoryNewsData && categoryNewsData[cat.slug] && categoryNewsData[cat.slug].length > 0;
    const hasDb = (dbArticles || []).some(
      (a) => a.categorySlug === cat.slug || a.category === cat.name
    );
    return hasStatic || hasDb;
  });

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="space-y-12">
          {displayCategories.map((cat, catIdx) => {
            const staticArticles = categoryNewsData[cat.slug] || [];
            const catDbArticles = (dbArticles || []).filter(
              (a) => a.categorySlug === cat.slug || a.category === cat.name
            );
            const articles = [...catDbArticles, ...staticArticles];
            if (articles.length === 0) return null;


            const accentColors = [
              "border-red-600 text-red-600 bg-red-600",
              "border-blue-600 text-blue-600 bg-blue-600",
              "border-emerald-600 text-emerald-600 bg-emerald-600",
              "border-amber-600 text-amber-600 bg-amber-600",
              "border-purple-600 text-purple-600 bg-purple-600",
              "border-rose-600 text-rose-600 bg-rose-600",
              "border-teal-600 text-teal-600 bg-teal-600",
            ];
            const currentAccent = accentColors[catIdx % accentColors.length];
            const [borderColor, textColor, bgColor] = currentAccent.split(" ");

            return (
              <div
                key={cat.id}
                id={`cat-${cat.slug}`}
                className="scroll-mt-24 pb-8 border-b border-slate-200 last:border-b-0"
              >

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-3 mb-6">

                  <div className="flex items-center gap-3 flex-wrap">
                    <Link
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-2 group hover:text-red-600 transition-colors"
                      title={`${cat.name} বিভাগের সব সংবাদ`}
                    >
                      <span className={`w-3.5 h-7 rounded-xs ${bgColor}`}></span>
                      <h3 className="font-serif-bangla text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-red-600 tracking-tight transition-colors">
                        {cat.name}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>


                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1 group transition-colors self-start sm:self-auto"
                  >
                    সব {cat.name} সংবাদ
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {articles.slice(0, 4).map((story) => (
                    <NewsCard
                      key={story.id}
                      news={story}
                      variant="horizontal"
                      imageWrapperClassName="w-32 sm:w-40 md:w-36 lg:w-44 aspect-[16/10]"
                      headlineTag="h4"
                      headlineSize="text-base sm:text-lg"
                      showSummary={true}
                      summaryClamp="line-clamp-2"
                      summarySize="text-xs sm:text-sm mt-1.5"
                      showSubcategory={false}
                      showCategory={false}
                      showTime={false}
                      contentWrapperClassName="justify-start"
                      className="h-full"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

