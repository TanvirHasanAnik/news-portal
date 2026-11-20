import Link from "next/link";
import { Cookie, ExternalLink, FileText, Lock, Mail, Shield } from "lucide-react";

export const metadata = {
  title: "গোপনীয়তা নীতি",
  description:
    "আলো আসবে (aloashbe.com) এর গোপনীয়তা নীতি, কুকি ব্যবহার এবং পাঠক তথ্যের সুরক্ষা নীতিমালা।",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-10 pb-6 border-b border-slate-200">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
          <Shield className="w-3.5 h-3.5 text-red-600" />
          সুরক্ষা ও নীতিমালা
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
          গোপনীয়তা নীতি (Privacy Policy)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          সর্বশেষ হালনাগাদ: ২০২৬
        </p>
      </div>

      <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            ১. পরিচিতি
          </h2>
          <p className="text-slate-600">
            &ldquo;আলো আসবে&rdquo; (<Link href="/" className="text-red-600 hover:underline">aloashbe.com</Link>) পাঠকদের তথ্যের গোপনীয়তা রক্ষা করতে দৃঢ়ভাবে অঙ্গীকারবদ্ধ। এই গোপনীয়তা নীতিমালায় বর্ণনা করা হয়েছে কীভাবে আপনি যখন আমাদের ওয়েবসাইট ব্যবহার করেন, তখন কী ধরনের তথ্য সংগৃহীত ও ব্যবহৃত হয় এবং কীভাবে তা সুরক্ষিত রাখা হয়।
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            ২. সংগৃহীত তথ্য ও ব্যবহার
          </h2>
          <div className="space-y-3 text-slate-600">
            <p>
              <strong>লগ ফাইলস (Log Files):</strong> অধিকাংশ পেশাদার ওয়েবসাইটের মতো আলো আসবে স্ট্যান্ডার্ড লগ ফাইল ব্যবহার করে। লগ ফাইলে সংরক্ষিত তথ্যের মধ্যে রয়েছে আপনার ইন্টারনেট প্রটোকল (IP) অ্যাড্রেস, ব্রাউজারের ধরন, ইন্টারনেট সার্ভিস প্রোভাইডার (ISP), তারিখ ও সময়, রেফারেল/প্রস্থান পৃষ্ঠা এবং ব্যবহারকারীর গতিবিধি। এই তথ্যগুলো কোনোভাবেই ব্যক্তিগতভাবে শনাক্তযোগ্য নয় এবং এগুলো মূলত সাইট প্রশাসন, নিরাপত্তা ও পাঠকদের অভিজ্ঞতা মূল্যায়নে ব্যবহৃত হয়।
            </p>
            <p>
              <strong>যোগাযোগের তথ্য:</strong> আপনি যখন ইমেইলের মাধ্যমে আমাদের সাথে সরাসরি যোগাযোগ করেন, তখন আপনার প্রেরিত নাম ও ইমেইল ঠিকানা শুধুমাত্র আপনার বার্তার উত্তর প্রদানের উদ্দেশ্যে ব্যবহার করা হয়।
            </p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-red-600" />
            ৩. কুকি (Cookies) এবং ওয়েব বীকন
          </h2>
          <p className="text-slate-600 mb-3">
            পাঠকদের ব্যক্তিগত ব্রাউজিং পছন্দ সংরক্ষণ করতে এবং সাইটের কার্যকারিতা বৃদ্ধির জন্য আলো আসবে কুকি (ছোট টেক্সট ফাইল) ব্যবহার করে। আপনি চাইলে আপনার ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকি নিষ্ক্রিয় বা নিয়ন্ত্রণ করতে পারেন।
          </p>
        </section>

        <section className="bg-red-50/50 p-6 rounded-2xl border border-red-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            ৪. গুগল অ্যাডসেন্স ও ডাবলক্লিক ডার্ট কুকি (Google AdSense)
          </h2>
          <div className="space-y-3 text-slate-600 text-sm sm:text-base">
            <p>
              গুগল (Google) আমাদের ওয়েবসাইটে একজন তৃতীয় পক্ষীয় বিজ্ঞাপন সরবরাহকারী (Third-party Vendor) হিসেবে কাজ করে।
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                গুগল আমাদের সাইট এবং ইন্টারনেটের অন্যান্য ওয়েবসাইটে পাঠকদের পূর্ববর্তী পরিদর্শনের ভিত্তিতে প্রাসঙ্গিক বিজ্ঞাপন প্রদর্শনের জন্য <strong>ডার্ট কুকি (DART Cookie)</strong> ব্যবহার করে।
              </li>
              <li>
                ব্যবহারকারী চাইলে গুগলের বিজ্ঞাপন সেটিংস পৃষ্ঠা পরিদর্শনের মাধ্যমে ব্যক্তিগতকৃত বিজ্ঞাপন প্রদর্শনে ডার্ট কুকির ব্যবহার বন্ধ (Opt-out) করতে পারেন।
              </li>
            </ul>
            <div className="pt-2">
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
              >
                গুগল বিজ্ঞাপন সেটিংস ও অপ্ট-আউট <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="mx-2 text-slate-300">|</span>
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:underline"
              >
                AboutAds পছন্দসমূহ <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-red-600" />
            ৫. তৃতীয় পক্ষের বিজ্ঞাপন ও লিংক
          </h2>
          <p className="text-slate-600">
            আমাদের ওয়েবসাইটে প্রদর্শিত তৃতীয় পক্ষের বিজ্ঞাপনদাতা এবং বাহ্যিক লিঙ্কগুলোর নিজস্ব গোপনীয়তা নীতিমালা রয়েছে। আমরা পাঠকদের পরামর্শ দেই সংশ্লিষ্ট তৃতীয় পক্ষের ওয়েবসাইটের নিজস্ব গোপনীয়তা নীতি পড়ে দেখার জন্য। তৃতীয় পক্ষের কার্যকলাপ বা তাদের সংরক্ষিত তথ্যের উপর আমাদের কোনো নিয়ন্ত্রণ নেই।
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
            ৬. শিশুদের গোপনীয়তা সুরক্ষা
          </h2>
          <p className="text-slate-600">
            ইন্টারনেট ব্যবহারের সময় শিশুদের তথ্যের নিরাপত্তা দেওয়া আমাদের অগ্রাধিকার। আলো আসবে ১৩ বছরের কম বয়সী শিশুদের কাছ থেকে জেনেশুনে কোনো ব্যক্তিগত পরিচয় শনাক্তকারী তথ্য সংগ্রহ করে না। কোনো অভিভাবক যদি মনে করেন তার সন্তান আমাদের ওয়েবসাইটে এমন তথ্য প্রদান করেছে, তবে অবিলম্বে আমাদের সাথে যোগাযোগ করার অনুরোধ করা হলো।
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Mail className="w-5 h-5 text-red-600" />
            ৭. যোগাযোগ
          </h2>
          <p className="text-slate-600 mb-3">
            আমাদের গোপনীয়তা নীতি সম্পর্কে আপনার কোনো জিজ্ঞাসা, মতামত বা অভিযোগ থাকলে নির্দ্বিধায় আমাদের সাথে যোগাযোগ করতে পারেন:
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-1">
            <p>
              <strong className="text-slate-800">ইমেইল:</strong>{" "}
              <a href="mailto:aloashbenews@gmail.com" className="text-red-600 hover:underline">
                aloashbenews@gmail.com
              </a>
            </p>
            <p>
              <strong className="text-slate-800">ঠিকানা:</strong> ইস্ট কাফরুল, ঢাকা ক্যান্টনমেন্ট, ঢাকা -১২০৬।
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
