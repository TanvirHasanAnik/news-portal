import React from "react";
import { Play, Camera, ArrowRight, Video } from "lucide-react";

export default function MediaGallery() {
  const videoItems = [
    {
      id: "v-1",
      title: "রাজধানীর এলিভেটেড এক্সপ্রেসওয়ের নতুন সংযোগ পয়েন্ট খুলে দেওয়া হলো",
      duration: "০৩:৪৫",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600&auto=format&fit=crop",
      views: "৪৫ হাজার দর্শন",
    },
    {
      id: "v-2",
      title: "চট্টগ্রাম সমুদ্রবন্দরে নতুন কন্টেইনার টার্মিনাল নির্মাণ কাজের বিশেষ প্রতিবেদন",
      duration: "০৫:১২",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600&auto=format&fit=crop",
      views: "৩২ হাজার দর্শন",
    },
    {
      id: "v-3",
      title: "সুন্দরবনের গহীনে বিরল প্রজাতির জীববৈচিত্র্য সংরক্ষণে আধুনিক ক্যামেরা ট্র্যাকিং",
      duration: "০৪:১৮",
      image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=600&auto=format&fit=crop",
      views: "৫৮ হাজার দর্শন",
    },
  ];

  return (
    <section className="py-8 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-600 text-white">
              <Video className="w-4 h-4" />
            </span>
            <h2 className="font-serif-bangla text-xl sm:text-2xl font-bold">
              ভিডিও ও ছবির গল্প
            </h2>
          </div>
          <a
            href="#all-videos"
            className="text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 group"
          >
            সব ভিডিও দেখুন
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {videoItems.map((v) => (
            <div
              key={v.id}
              className="group relative rounded-xl overflow-hidden bg-slate-800/80 border border-slate-700/80 hover:border-red-500/50 transition-all duration-300 cursor-pointer"
            >
              {/* Thumbnail with Play Icon */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                <img
                  src={v.image}
                  alt={v.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <span className="absolute bottom-2 right-2 rounded bg-black/80 backdrop-blur-xs px-2 py-0.5 text-[11px] font-semibold text-white">
                  {v.duration}
                </span>
              </div>

              {/* Title & Views */}
              <div className="p-4">
                <h3 className="font-serif-bangla text-sm sm:text-base font-bold leading-snug line-clamp-2 text-slate-100 group-hover:text-red-400 transition-colors mb-2">
                  {v.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{v.views}</span>
                  <span className="text-red-400 font-medium">দেখুন</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

