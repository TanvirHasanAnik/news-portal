import Link from "next/link";
import {
  SITE_NAME,
  CONTACT_EMAIL,
  OFFICE_ADDRESS,
  SITE_DOMAIN,
} from "@/config/siteInfo";

export const metadata = {
  title: "গোপনীয়তা নীতি",
  description: `${SITE_NAME} (${SITE_DOMAIN}) এর গোপনীয়তা নীতি, কুকি ব্যবহার এবং পাঠক তথ্যের সুরক্ষা নীতিমালা।`,
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-10 pb-6 border-b border-slate-200">
        <span className="inline-block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">
          গোপনীয়তা ও ডেটা সুরক্ষা নীতিমালা
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
          গোপনীয়তা নীতি (Privacy Policy)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          সর্বশেষ সংস্করণ: ২০২৬
        </p>
      </div>

      <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
            ১. পরিচিতি
          </h2>
          <p className="text-slate-600">
            &ldquo;{SITE_NAME}&rdquo; (<Link href="/" className="text-blue-600 hover:underline">{SITE_DOMAIN}</Link>) পাঠকদের তথ্যের গোপনীয়তা রক্ষা করতে দৃঢ়ভাবে অঙ্গীকারবদ্ধ। এই গোপনীয়তা নীতিমালায় বর্ণনা করা হয়েছে কীভাবে আপনি যখন আমাদের ওয়েবসাইট ব্যবহার করেন, তখন কী ধরনের তথ্য সংগৃহীত ও ব্যবহৃত হয় এবং কীভাবে তা সুরক্ষিত রাখা হয়।
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
            ২. সংগৃহীত তথ্য ও ব্যবহার
          </h2>
          <div className="space-y-3 text-slate-600">
            <p>
              আমাদের ওয়েবসাইট ভিজিট করার সময় আমরা সরাসরি কোনো ব্যক্তিগত তথ্য সংগ্রহ করি না, যতক্ষণ না আপনি নিজে থেকে কোনো ফর্ম পূরণ করেন বা আমাদের সাথে যোগাযোগ করেন।
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>স্বয়ংক্রিয় তথ্য:</strong> ব্রাউজারের ধরন, আইপি অ্যাড্রেস, অপারেটিং সিস্টেম ও ভিজিট করা পৃষ্ঠার তথ্য (অ্যানালিটিক্স বিশ্লেষণের জন্য)।
              </li>
              <li>
                <strong>যোগাযোগের তথ্য:</strong> আপনি যখন ইমেইল বা মেসেজের মাধ্যমে যোগাযোগ করেন, তখন আপনার নাম ও ইমেইল ঠিকানা সংরক্ষণ করা হতে পারে।
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
            ৩. কুকিজ (Cookies) ও ওয়েব বিকন
          </h2>
          <p className="text-slate-600 leading-relaxed">
            ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে আমরা &apos;কুকিজ&apos; ব্যবহার করি। কুকি হলো ছোট ফাইল যা ব্রাউজারের মাধ্যমে আপনার ডিভাইসে সংরক্ষিত থাকে। এটি ব্যবহারকারীর পছন্দ সংরক্ষণ এবং সাইটের কার্যক্ষমতা ট্র্যাক করতে সহায়তা করে। আপনি চাইলে আপনার ব্রাউজার সেটিংসে গিয়ে কুকিজ নিষ্ক্রিয় করতে পারেন।
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
            ৪. গুগল অ্যাডসেন্স ও বিজ্ঞাপন নীতি
          </h2>
          <p className="text-slate-600 leading-relaxed">
            আমাদের ওয়েবসাইটে গুগল সহ তৃতীয় পক্ষের বিজ্ঞাপন নেটওয়ার্ক বিজ্ঞাপন প্রদর্শনের জন্য ব্যবহৃত হতে পারে। গুগল বিজ্ঞাপন কাস্টমাইজ করতে DART কুকি ব্যবহার করতে পারে। পাঠকরা গুগলের গোপনীয়তা নীতিমালা পরিদর্শনের মাধ্যমে DART কুকির ব্যবহার থেকে নিজেদের বিরত রাখতে পারেন।
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
            ৫. তথ্যের নিরাপত্তা
          </h2>
          <p className="text-slate-600 leading-relaxed">
            আমরা পাঠকদের ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিতে সংবেদনশীল ব্যবস্থা গ্রহণ করে থাকি। তবে মনে রাখা প্রয়োজন, ইন্টারনেটে কোনো তথ্য আদান-প্রদান শতভাগ ঝুঁকিমুক্ত নয়।
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
            ৬. তৃতীয় পক্ষের লিঙ্ক
          </h2>
          <p className="text-slate-600 leading-relaxed">
            আমাদের প্রতিবেদনে প্রাসঙ্গিক তথ্যের খাতিরে অন্যান্য ওয়েবসাইটের লিঙ্ক থাকতে পারে। সেই সমস্ত বহিরাগত সাইটের বিষয়বস্তু বা গোপনীয়তা নীতির জন্য আলো আসবে কর্তৃপক্ষ দায়ী নয়।
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
            ৭. শিশুদের গোপনীয়তা সুরক্ষা
          </h2>
          <p className="text-slate-600 leading-relaxed">
            ইন্টারনেট ব্যবহারের সময় শিশুদের তথ্যের নিরাপত্তা দেওয়া আমাদের অগ্রাধিকার। {SITE_NAME} ১৩ বছরের কম বয়সী শিশুদের কাছ থেকে জেনেশুনে কোনো ব্যক্তিগত পরিচয় শনাক্তকারী তথ্য সংগ্রহ করে না। কোনো অভিভাবক যদি মনে করেন তার সন্তান আমাদের ওয়েবসাইটে এমন তথ্য প্রদান করেছে, তবে অবিলম্বে আমাদের সাথে যোগাযোগ করার অনুরোধ করা হলো।
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
            ৮. যোগাযোগ
          </h2>
          <p className="text-slate-600 mb-3">
            আমাদের গোপনীয়তা নীতি সম্পর্কে আপনার কোনো জিজ্ঞাসা, মতামত বা অভিযোগ থাকলে নির্দ্বিধায় আমাদের সাথে যোগাযোগ করতে পারেন:
          </p>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-1">
            <p>
              <strong className="text-slate-800">ইমেইল:</strong>{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <p>
              <strong className="text-slate-800">ঠিকানা:</strong> {OFFICE_ADDRESS}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
