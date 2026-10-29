import React from "react";
import NewsCard from "./NewsCard";
import MostReadSection from "./MostReadSection";
import { handpickedNewsList } from "../data/handpickedNewsData";
import { trendingNews } from "../data/newsData";
import { getOptimizedNewsImage } from "../utils/imageUtils";



const staticMostReadNews = trendingNews.map((item) => ({
  ...item,
  image: getOptimizedNewsImage(item.image, 240, 70),
}));



export default function HandpickedNewsSection({
  newsList,
  mostReadList = staticMostReadNews,
  dbArticles = [],
}) {
  const handpickedDb = dbArticles.filter((a) => a.isHandpicked);
  const displayNews = (newsList && newsList.length > 0)
    ? newsList.slice(0, 4)
    : [...handpickedDb, ...handpickedNewsList].slice(0, 4);
  const count = displayNews.length;

  if (count === 0) return null;

  return (
    <section id="handpicked" className="py-6 sm:py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">



          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>

              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-red-600 inline-block"></span>
                  <h2 className="font-serif-bangla text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    বাছাইকৃত সংবাদ
                  </h2>
                </div>
              </div>



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



          <div className="lg:col-span-1 relative lg:h-full">
            <MostReadSection
              newsList={mostReadList}
              className="h-full lg:absolute lg:inset-0"
              listClassName="h-[360px] sm:h-[385px] lg:h-auto lg:flex-1 min-h-0 overflow-y-auto pr-2 divide-y divide-slate-100 custom-scrollbar overscroll-contain"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
