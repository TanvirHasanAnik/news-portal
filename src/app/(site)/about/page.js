import Link from "next/link";
import { Award, Compass, HeartHandshake, Mail, MapPin, Newspaper, ShieldCheck, Users } from "lucide-react";

export const metadata = {
  title: "আমাদের সম্পর্কে",
  description:
    "আলো আসবে - সত্যের পথে, মানুষের সাথে। একটি স্বাধীন, দায়িত্বশীল ও তথ্যবহুল ডিজিটাল সংবাদ মাধ্যম।",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-10 pb-8 border-b border-slate-200">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wider mb-4 border border-red-100">
          <Newspaper className="w-3.5 h-3.5" />
          পরিচিতি
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
          সত্যের পথে, মানুষের সাথে
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          &ldquo;আলো আসবে&rdquo; একটি স্বাধীন, নিরপেক্ষ ও দায়িত্বশীল ডিজিটাল সংবাদ মাধ্যম। নির্ভুল তথ্য, সৎ বিশ্লেষণ এবং সত্যনিষ্ঠ সংবাদ পাঠকের কাছে পৌঁছে দেওয়াই আমাদের মূল লক্ষ্য।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">আমাদের লক্ষ্য</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            গণমানুষের অধিকার, সমাজের ইতিবাচক রূপান্তর এবং দেশের প্রতিটি প্রান্তে ঘটে যাওয়া ঘটনাবলীর বস্তুনিষ্ঠ চিত্র তুলে ধরা। আমরা বিভ্রান্তি ও অপতথ্যের বিপরীতে নির্ভরযোগ্য সংবাদের আলোকবর্তিকা হতে চাই।
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">আমাদের দায়বদ্ধতা</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            কোনো প্রকার পক্ষপাতিত্ব বা চাপের কাছে নতি স্বীকার না করে সংবিধান, নাগরিক স্বাধীনতা ও ন্যায়বিচারের পক্ষে শক্ত অবস্থান নেওয়া আমাদের সম্পাদকীয় নীতির ভিত্তি।
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-red-600" />
          সম্পাদকীয় নীতিমালা ও মূল্যবোধ
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-red-600 font-bold shrink-0 text-sm">
              ১
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">তথ্য যাচাই ও নির্ভুলতা</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                প্রকাশের পূর্বে নির্ভরযোগ্য একাধিক উৎস থেকে তথ্যের সত্যতা কঠোরভাবে পরীক্ষা করা হয়।
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-red-600 font-bold shrink-0 text-sm">
              ২
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">নিরপেক্ষ দৃষ্টিভঙ্গি</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                কোনো ব্যক্তি, রাজনৈতিক দল বা বাণিজ্যিক স্বার্থের ঊর্ধ্বে থেকে ভারসাম্যপূর্ণ সংবাদ প্রদান।
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-red-600 font-bold shrink-0 text-sm">
              ৩
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">জনস্বার্থ ও ইতিবাচকতা</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                জনগণের সংকট ও সাফল্যের গল্প তুলে ধরে একটি মানবিক ও সচেতন সমাজ গঠনে সহায়তা করা।
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-red-600 font-bold shrink-0 text-sm">
              ৪
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">স্বচ্ছতা ও সংশোধন</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                অনিচ্ছাকৃত কোনো তথ্যের ভুল ধরা পড়লে কালক্ষেপণ না করে দ্রুত স্পষ্ট সংশোধনী প্রকাশ।
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-bold text-slate-900">নেতৃত্ব ও যোগাযোগের তথ্য</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block mb-1">পরিচালক</span>
            <span className="text-base font-bold text-slate-900">মো: ফুয়াদ হাসান</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block mb-1">প্রকাশক</span>
            <span className="text-base font-bold text-slate-900">মোঃ তৌহিদুল ইসলাম</span>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-800">সম্পাদকীয় ও বাণিজ্য বিভাগ:</strong> ইস্ট কাফরুল, ঢাকা ক্যান্টনমেন্ট, ঢাকা -১২০৬।
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong className="text-slate-800">ইমেইল:</strong>{" "}
              <a href="mailto:aloashbenews@gmail.com" className="text-red-600 hover:underline">
                aloashbenews@gmail.com
              </a>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong className="text-slate-800">ওয়েবসাইট:</strong>{" "}
              <Link href="/" className="text-slate-900 hover:text-red-600 font-medium">
                aloashbe.com
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
