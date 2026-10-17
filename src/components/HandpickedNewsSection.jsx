import React from "react";
import NewsCard from "./NewsCard";
import { handpickedNewsList } from "../data/handpickedNewsData";
import { trendingNews } from "../data/newsData";
import { getOptimizedNewsImage } from "../utils/imageUtils";

/**
 * Pre-optimized most read news list at module scope
 * (Executed once on server, 0 client hydration cost)
 */
const staticMostReadNews = trendingNews.map((item) => ({
  ...item,
  image: getOptimizedNewsImage(item.image, 240, 70),
}));

/**
 * HandpickedNewsSection (বাছাইকৃত সংবাদ ও সর্বাধিক পঠিত) - Server Component
 * 
 * Column ratio: 2 : 1
 * - First column (Width 2): Handpicked news (বাছাইকৃত সংবাদ)
 * - Second column (Width 1): Most read news (সর্বাধিক পঠিত) with own scrollbar
 */
export default function HandpickedNewsSection({
  newsList = handpickedNewsList,
  mostReadList = staticMostReadNews,
}) {
  const displayNews = newsList.slice(0, 4);
  const count = displayNews.length;

  if (count === 0) return null;

  return (
    <section id="handpicked" className="py-6 sm:py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2:1 Column Ratio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* =========================================================================
              FIRST COLUMN (Ratio 2) - Handpicked News (বাছাইকৃত সংবাদ)
             ========================================================================= */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              {/* Section Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-red-600 inline-block"></span>
                  <h2 className="font-serif-bangla text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    বাছাইকৃত সংবাদ
                  </h2>
                </div>
              </div>

              {/* Handpicked News Cards Container */}
              {/* Rule 1: Exactly 1 handpicked news -> Takes the whole space */}
              {count === 1 && (
                <NewsCard
                  news={displayNews[0]}
                  variant="vertical"
                  imageSrc={getOptimizedNewsImage(displayNews[0].image, 800, 75)}
                  imageAspect="aspect-[21/9] sm:aspect-[2.4/1]"
                  imageWrapperClassName="max-h-[280px] sm:max-h-[320px]"
                  headlineTag="h3"
                  headlineSize="text-xl sm:text-2xl lg:text-3xl mt-3 sm:mt-4"
                  summaryClamp="line-clamp-3"
                  summarySize="text-sm sm:text-base mt-2 sm:mt-2.5"
                  className="w-full"
                />
              )}

              {/* Rule 2: Exactly 2 handpicked news -> Divide the space horizontally */}
              {count === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                  {displayNews.map((news) => (
                    <NewsCard
                      key={news.id}
                      news={news}
                      variant="vertical"
                      imageSrc={getOptimizedNewsImage(news.image, 500, 75)}
                      imageAspect="aspect-[16/9]"
                      imageWrapperClassName="max-h-[200px] sm:max-h-[230px]"
                      headlineTag="h3"
                      headlineSize="text-base sm:text-lg lg:text-xl mt-2.5"
                      summaryClamp="line-clamp-2"
                      summarySize="text-xs sm:text-sm mt-1.5"
                    />
                  ))}
                </div>
              )}

              {/* Rule 3: 3 or 4 handpicked news -> 2x2 grid with compact image space */}
              {count >= 3 && (
                <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                  {displayNews.map((news) => (
                    <NewsCard
                      key={news.id}
                      news={news}
                      variant="vertical"
                      imageSrc={getOptimizedNewsImage(news.image, 450, 75)}
                      imageAspect="aspect-[16/10] sm:aspect-[16/9]"
                      imageWrapperClassName="max-h-[160px] sm:max-h-[180px] md:max-h-[200px]"
                      headlineTag="h3"
                      headlineSize="text-sm sm:text-base lg:text-lg mt-2 sm:mt-2.5"
                      summaryClamp="line-clamp-2"
                      summarySize="text-xs sm:text-[13px] mt-1"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* =========================================================================
              SECOND COLUMN (Ratio 1) - Most Read News (সর্বাধিক পঠিত)
              Takes the exact same height as the first column with its own scroll bar
             ========================================================================= */}
          <div className="lg:col-span-1 relative lg:h-full">
            <div className="flex flex-col h-full lg:absolute lg:inset-0">
              
              {/* Sidebar Header */}
              <div className="flex items-center gap-2.5 border-b-2 border-slate-900 pb-3 mb-3 shrink-0">
                <span className="w-2.5 h-6 bg-red-600 inline-block"></span>
                <h3 className="font-serif-bangla text-2xl font-bold text-slate-900 tracking-tight">
                  সর্বাধিক পঠিত
                </h3>
              </div>

              {/* Scrollable News List: 4 news items upfront on mobile with scroll for remaining */}
              <div className="h-[360px] sm:h-[385px] lg:h-auto lg:flex-1 min-h-0 overflow-y-auto pr-2 divide-y divide-slate-100 custom-scrollbar overscroll-contain">
                {mostReadList.map((item) => (
                  <NewsCard
                    key={`${item.categorySlug || item.category}-${item.id}`}
                    news={item}
                    variant="horizontal"
                    imageWrapperClassName="w-24 h-16 sm:w-28 sm:h-18"
                    headlineTag="h4"
                    headlineSize="text-sm sm:text-[15px]"
                    showCategory={true}
                    categoryPlacement="bottom"
                    showSummary={false}
                    className="items-center py-3 first:pt-0 last:pb-0"
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
