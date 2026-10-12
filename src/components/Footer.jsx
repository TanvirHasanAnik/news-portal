"use client";

import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUp,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  FacebookIcon,
  YoutubeIcon,
  TwitterXIcon,
  InstagramIcon,
  LinkedinIcon,
} from "./SocialIcons";
import { categories } from "../data/newsData";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Footer: Brand, Tagline, Socials & Back to Top */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-red-600 text-white flex items-center justify-center font-serif-bangla text-2xl font-black shadow-md">
              খ
            </div>
            <div>
              <h2 className="font-serif-bangla text-2xl sm:text-3xl font-black text-white">
                দৈনিক খবর প্রবাহ
              </h2>
              <p className="text-xs text-slate-400">
                সত্য ও সাহসের অগ্রদূত • THE LEADING BANGLADESHI DAILY
              </p>
            </div>
          </div>

          {/* Social Links & Back to Top */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-slate-400">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="p-2 rounded-full bg-slate-900 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                aria-label="YouTube"
                className="p-2 rounded-full bg-slate-900 hover:bg-red-600 hover:text-white transition-colors"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                aria-label="Twitter / X"
                className="p-2 rounded-full bg-slate-900 hover:bg-sky-500 hover:text-white transition-colors"
              >
                <TwitterXIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="p-2 rounded-full bg-slate-900 hover:bg-pink-600 hover:text-white transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                className="p-2 rounded-full bg-slate-900 hover:bg-blue-700 hover:text-white transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-600 text-white text-xs font-semibold transition-colors shadow-xs ml-auto sm:ml-0"
            >
              <ArrowUp className="w-4 h-4" />
              <span>উপরে যান</span>
            </button>
          </div>
        </div>

        {/* Main Footer Links & Editorial Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-10 border-b border-slate-800 text-sm">
          {/* Editorial & Office Address */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif-bangla text-base font-bold text-white border-b border-slate-800 pb-2">
              সম্পাদকীয় ও প্রশাসনিক কার্যালয়
            </h4>
            <div className="text-xs sm:text-sm text-slate-400 space-y-2">
              <p>
                <strong className="text-slate-200">সম্পাদক ও প্রকাশক:</strong> মোস্তাফিজুর রহমান
              </p>
              <p>
                <strong className="text-slate-200">নির্বাহী সম্পাদক:</strong> ড. তানভীর আহমেদ
              </p>
              <p className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>প্রগতি টাওয়ার, ২০-২১ কারওয়ান বাজার বাণিজ্যিক এলাকা, ঢাকা-১২১৫, বাংলাদেশ।</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>+৮৮০ ২ ৮১৮৯xxx, +৮৮০ ১৭xxxxxxxx</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>news@khoborprobaho.com, ads@khoborprobaho.com</span>
              </p>
            </div>

            {/* Mobile App Downloads */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-2 font-medium">মোবাইল অ্যাপ ডাউনলোড করুন:</span>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 cursor-pointer">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">GET IT ON</div>
                    <div className="font-bold text-white leading-none">Google Play</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 cursor-pointer">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Download on the</div>
                    <div className="font-bold text-white leading-none">App Store</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Categories Column 1 */}
          <div>
            <h4 className="font-serif-bangla text-base font-bold text-white border-b border-slate-800 pb-2 mb-3">
              প্রধান বিভাগ
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <a href={`#cat-${cat.slug}`} className="hover:text-red-400 transition-colors">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Categories Column 2 */}
          <div>
            <h4 className="font-serif-bangla text-base font-bold text-white border-b border-slate-800 pb-2 mb-3">
              অন্যান্য বিভাগ
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              {categories.slice(5).map((cat) => (
                <li key={cat.id}>
                  <a href={`#cat-${cat.slug}`} className="hover:text-red-400 transition-colors">
                    {cat.name}
                  </a>
                </li>
              ))}
              <li>
                <a href="#photo-gallery" className="hover:text-red-400 transition-colors">
                  ছবি গ্যালারি
                </a>
              </li>
              <li>
                <a href="#video-gallery" className="hover:text-red-400 transition-colors">
                  ভিডিও সংবাদ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Newspaper Utilities */}
          <div>
            <h4 className="font-serif-bangla text-base font-bold text-white border-b border-slate-800 pb-2 mb-3">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#about" className="hover:text-red-400 transition-colors">
                  আমাদের সম্পর্কে
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-red-400 transition-colors">
                  ব্যবহারের শর্তাবলী
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-red-400 transition-colors">
                  গোপনীয়তা নীতি
                </a>
              </li>
              <li>
                <a href="#advertise" className="hover:text-red-400 transition-colors">
                  বিজ্ঞাপন মূল্যতালিকা
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-red-400 transition-colors">
                  যোগাযোগ ও মতামত
                </a>
              </li>
              <li>
                <a href="#epaper" className="hover:text-red-400 transition-colors font-medium text-red-400">
                  ই-পেপার সংস্করণ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © ২০২৬ দৈনিক খবর প্রবাহ। সর্বস্বত্ব সংরক্ষিত। অনুমতি ছাড়া এই ওয়েবসাইটের কোনো লেখা বা ছবি প্রকাশ বেআইনি।
          </p>
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>বাংলাদেশ তথ্য ও সম্প্রচার মন্ত্রণালয় কর্তৃক নিবন্ধিত</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

