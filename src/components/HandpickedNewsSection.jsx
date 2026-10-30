import React from "react";
import NewsCard from "./NewsCard";
import MostReadSection from "./MostReadSection";
import { getOptimizedNewsImage } from "../utils/imageUtils";
import { Newspaper } from "lucide-react";

export default function HandpickedNewsSection({
  newsList = [],
  mostReadList = [],
  dbArticles = [],
}) {
  const handpickedDb = (dbArticles || []).filter((a) => a.isHandpicked);
  const displayNews = (newsList && newsList.length > 0)
    ? newsList.slice(0, 4)
    : handpickedDb.slice(0, 4);
  const count = displayNews.length;

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

              {count === 0 ? (
                <div className="bg-slate-50 border border-slate-200 p-8 sm:p-12 text-center space-y-3 rounded-none">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif-bangla text-lg sm:text-xl font-bold text-slate-800">
                    বর্তমানে কোনো বাছাইকৃত সংবাদ নেই
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                    শীঘ্রই সম্পাদকীয় বিভাগ থেকে বাছাইকৃত বিশেষ সংবাদসমূহ এখানে প্রদর্শিত হবে।
                  </p>
                </div>
              ) : count === 1 ? (
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
              ) : count === 2 ? (
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
              ) : (
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

          <div className="lg:col-span-1 flex flex-col h-full">
            <MostReadSection
              newsList={mostReadList}
              className="h-full flex flex-col"
              listClassName="h-[360px] sm:h-[400px] lg:h-[420px] overflow-y-auto pr-2 divide-y divide-slate-100 custom-scrollbar overscroll-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
