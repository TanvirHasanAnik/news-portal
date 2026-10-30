import React from "react";
import NewsCard from "./NewsCard";
import AdHolder from "./AdHolder";
import { Newspaper } from "lucide-react";

export default function LatestMixedSection({ dbArticles = [] }) {
  const seen = new Set();
  const sortedNews = [];
  for (const item of dbArticles || []) {
    if (!item) continue;
    const key = item.id || item.slug || item.dbId;
    if (key && !seen.has(key)) {
      seen.add(key);
      sortedNews.push(item);
    }
  }

  const isRichLayout = sortedNews.length >= 6;
  const mostRecentStory = sortedNews[0];
  const secondColumnStories = sortedNews.slice(1, 5);
  const firstColumnStories = sortedNews.slice(5, 9);
  const mobileGridStories = sortedNews.slice(1, 7);
  const mobileBottomStories = sortedNews.slice(7, 9);
  const remainingCategoryStyleStories = sortedNews.slice(1);

  return (
    <section id="latest" className="scroll-mt-14 py-6 sm:py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-8">
            {sortedNews.length === 0 ? (
              <div className="bg-white border border-slate-200 p-10 text-center space-y-3 max-w-xl mx-auto my-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Newspaper className="w-6 h-6" />
                </div>
                <h2 className="font-serif-bangla text-xl font-bold text-slate-800">
                  বর্তমানে কোনো সংবাদ প্রকাশিত হয়নি
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  আমাদের সংবাদকর্মীরা নিয়মিত নতুন সংবাদ যুক্ত করছেন। শীঘ্রই নতুন সংবাদ প্রকাশিত হবে।
                </p>
              </div>
            ) : isRichLayout ? (
              <>
                {mostRecentStory && (
                  <>
                    <NewsCard
                      news={mostRecentStory}
                      variant="vertical"
                      reverseOrder={true}
                      imageAspect="aspect-[16/10]"
                      headlineTag="h2"
                      headlineSize="text-xl sm:text-2xl"
                      headlineClamp=""
                      summaryClamp="line-clamp-3"
                      summarySize="text-sm"
                      imagePriority={true}
                      className="gap-3 md:hidden"
                    />

                    <NewsCard
                      news={mostRecentStory}
                      variant="hero"
                      headlineTag="h2"
                      headlineSize="text-2xl sm:text-3xl lg:text-[28px] xl:text-3xl"
                      headlineClamp=""
                      summaryClamp="line-clamp-4"
                      summarySize="text-sm sm:text-base mt-3.5"
                      imageWrapperClassName="min-h-[300px] lg:min-h-[330px]"
                      imagePriority={true}
                      className="hidden md:flex gap-4 lg:gap-5"
                    />
                  </>
                )}

                <div className="border-b border-slate-200" />

                <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:hidden">
                  {mobileGridStories.map((news) => (
                    <NewsCard
                      key={news.id}
                      news={news}
                      variant="compact"
                      imageAspect="aspect-square"
                      headlineTag="h3"
                      headlineSize="text-xs sm:text-sm mt-2"
                      showSummary={false}
                    />
                  ))}
                </div>

                {mobileBottomStories.length > 0 && (
                  <div className="border-b border-slate-200 md:hidden" />
                )}

                {mobileBottomStories.length > 0 && (
                  <div className="flex flex-col gap-4 sm:gap-5 md:hidden">
                    {mobileBottomStories.map((news) => (
                      <NewsCard
                        key={news.id}
                        news={news}
                        variant="horizontal"
                        imageWrapperClassName="w-28 sm:w-32 aspect-[4/3]"
                        headlineTag="h3"
                        headlineSize="text-sm sm:text-base"
                        showSummary={true}
                        summaryClamp="line-clamp-2"
                        summarySize="text-xs sm:text-[13px] mt-1.5"
                      />
                    ))}
                  </div>
                )}

                <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                  <div className="md:col-span-1 flex flex-col justify-between h-full gap-4 lg:gap-5">
                    {firstColumnStories.map((news) => (
                      <NewsCard
                        key={news.id}
                        news={news}
                        variant="row-summary"
                        imageWrapperClassName="w-24 h-16 sm:w-26 sm:h-18 md:w-20 md:h-16 lg:w-24 lg:h-18"
                        headlineTag="h3"
                        headlineSize="text-sm lg:text-[15px]"
                        showSummary={true}
                        summaryClamp="line-clamp-2"
                        summarySize="text-xs sm:text-[13px] mt-2"
                        className="flex-1 py-0.5"
                      />
                    ))}
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 h-full content-between">
                    {secondColumnStories.map((news) => (
                      <NewsCard
                        key={news.id}
                        news={news}
                        variant="vertical"
                        imageAspect="aspect-[16/10]"
                        headlineTag="h3"
                        headlineSize="text-base mt-2.5"
                        showSummary={true}
                        summaryClamp="line-clamp-2"
                        summarySize="text-xs sm:text-sm mt-1.5"
                        className="h-full"
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {mostRecentStory && (
                  <>
                    <NewsCard
                      news={mostRecentStory}
                      variant="vertical"
                      reverseOrder={true}
                      imageAspect="aspect-[16/10]"
                      headlineTag="h2"
                      headlineSize="text-xl sm:text-2xl"
                      headlineClamp=""
                      summaryClamp="line-clamp-3"
                      summarySize="text-sm"
                      imagePriority={true}
                      className="gap-3 md:hidden"
                    />

                    <NewsCard
                      news={mostRecentStory}
                      variant="hero"
                      headlineTag="h2"
                      headlineSize="text-2xl sm:text-3xl lg:text-[28px] xl:text-3xl"
                      headlineClamp=""
                      summaryClamp="line-clamp-4"
                      summarySize="text-sm sm:text-base mt-3.5"
                      imageWrapperClassName="min-h-[300px] lg:min-h-[330px]"
                      imagePriority={true}
                      className="hidden md:flex gap-4 lg:gap-5"
                    />
                  </>
                )}

                {remainingCategoryStyleStories.length > 0 && (
                  <>
                    <div className="border-b border-slate-200" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                      {remainingCategoryStyleStories.map((story) => (
                        <NewsCard
                          key={story.id}
                          news={story}
                          variant="vertical"
                          imageAspect="aspect-[16/10]"
                          headlineTag="h3"
                          headlineSize="text-base sm:text-lg font-bold"
                          showSummary={true}
                          summaryClamp="line-clamp-2"
                          summarySize="text-xs sm:text-sm mt-1.5"
                          className="h-full"
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6 items-center">
            <AdHolder size="300x250" />
            <AdHolder size="300x250" />
          </div>
        </div>
      </div>
    </section>
  );
}
