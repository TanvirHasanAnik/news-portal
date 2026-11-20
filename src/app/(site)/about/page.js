import Link from "next/link";

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
      <div className="mb-10 pb-8 border-b border-slate-200">
        <span className="inline-block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">
          আমাদের পরিচিতি
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
          সত্যের পথে, মানুষের সাথে
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
          &ldquo;আলো আসবে&rdquo; একটি স্বাধীন, নিরপেক্ষ ও দায়িত্বশীল ডিজিটাল সংবাদ মাধ্যম। নির্ভুল তথ্য, সৎ বিশ্লেষণ এবং সত্যনিষ্ঠ সংবাদ পাঠকের কাছে পৌঁছে দেওয়াই আমাদের মূল লক্ষ্য।
        </p>
      </div>

      <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-2">আমাদের লক্ষ্য</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              গণমানুষের অধিকার, সমাজের ইতিবাচক রূপান্তর এবং দেশের প্রতিটি প্রান্তে ঘটে যাওয়া ঘটনাবলীর বস্তুনিষ্ঠ চিত্র তুলে ধরা। আমরা বিভ্রান্তি ও অপতথ্যের বিপরীতে নির্ভরযোগ্য সংবাদের আলোকবর্তিকা হতে চাই।
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-2">আমাদের দায়বদ্ধতা</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              কোনো প্রকার পক্ষপাতিত্ব বা চাপের কাছে নতি স্বীকার না করে সংবিধান, নাগরিক স্বাধীনতা ও ন্যায়বিচারের পক্ষে শক্ত অবস্থান নেওয়া আমাদের সম্পাদকীয় নীতির ভিত্তি।
            </p>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            সম্পাদকীয় নীতিমালা ও মূল্যবোধ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border-l-2 border-blue-500 pl-4">
              <h3 className="font-semibold text-slate-900 mb-1">১. তথ্য যাচাই ও নির্ভুলতা</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                প্রকাশের পূর্বে নির্ভরযোগ্য একাধিক উৎস থেকে তথ্যের সত্যতা কঠোরভাবে পরীক্ষা করা হয়।
              </p>
            </div>

            <div className="border-l-2 border-blue-500 pl-4">
              <h3 className="font-semibold text-slate-900 mb-1">২. নিরপেক্ষ দৃষ্টিভঙ্গি</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                কোনো ব্যক্তি, রাজনৈতিক দল বা বাণিজ্যিক স্বার্থের ঊর্ধ্বে থেকে ভারসাম্যপূর্ণ সংবাদ প্রদান।
              </p>
            </div>

            <div className="border-l-2 border-blue-500 pl-4">
              <h3 className="font-semibold text-slate-900 mb-1">৩. জনস্বার্থ ও ইতিবাচকতা</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                জনগণের সংকট ও সাফল্যের গল্প তুলে ধরে একটি মানবিক ও সচেতন সমাজ গঠনে সহায়তা করা।
              </p>
            </div>

            <div className="border-l-2 border-blue-500 pl-4">
              <h3 className="font-semibold text-slate-900 mb-1">৪. স্বচ্ছতা ও সংশোধন</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                অনিচ্ছাকৃত কোনো তথ্যের ভুল ধরা পড়লে কালক্ষেপণ না করে দ্রুত স্পষ্ট সংশোধনী প্রকাশ।
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 rounded-xl border border-slate-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">নেতৃত্ব ও যোগাযোগের তথ্য</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-200">
            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block mb-1">পরিচালক</span>
              <span className="text-base font-bold text-slate-900">মো: ফুয়াদ হাসান</span>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block mb-1">প্রকাশক</span>
              <span className="text-base font-bold text-slate-900">মোঃ তৌহিদুল ইসলাম</span>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <p>
              <strong className="text-slate-800">সম্পাদকীয় ও বাণিজ্য বিভাগ:</strong> ইস্ট কাফরুল, ঢাকা ক্যান্টনমেন্ট, ঢাকা -১২০৬।
            </p>
            <p>
              <strong className="text-slate-800">ইমেইল:</strong>{" "}
              <a href="mailto:aloashbenews@gmail.com" className="text-blue-600 hover:text-blue-700 hover:underline">
                aloashbenews@gmail.com
              </a>
            </p>
            <p>
              <strong className="text-slate-800">ওয়েবসাইট:</strong>{" "}
              <Link href="/" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                aloashbe.com
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
