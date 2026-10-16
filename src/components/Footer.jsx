"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUp,
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
    <footer className="bg-white text-slate-600 pt-10 pb-8 border-t-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Footer: Brand Logo, Socials & Back to Top */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <Link href="/" className="inline-block group focus:outline-none">
            <img
              src="/brand-logo.svg"
              alt="আলো আসবে - সত্য ও সাহসের অগ্রদূত"
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Social Links & Back to Top */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-slate-500">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="p-2 rounded-full bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 transition-colors border border-slate-200"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                aria-label="YouTube"
                className="p-2 rounded-full bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 transition-colors border border-slate-200"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                aria-label="Twitter / X"
                className="p-2 rounded-full bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 transition-colors border border-slate-200"
              >
                <TwitterXIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="p-2 rounded-full bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 transition-colors border border-slate-200"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                className="p-2 rounded-full bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 transition-colors border border-slate-200"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-red-600 text-slate-700 hover:text-white text-xs font-semibold transition-colors border border-slate-200 shadow-xs ml-auto sm:ml-0 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
              <span>উপরে যান</span>
            </button>
          </div>
        </div>

        {/* Main Footer Links & Editorial Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-8 border-b border-slate-200 text-sm">
          {/* Editorial & Office Address */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif-bangla text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
              সম্পাদকীয় ও প্রশাসনিক কার্যালয়
            </h4>
            <div className="text-xs sm:text-sm text-slate-600 space-y-2">
              <p>
                <strong className="text-slate-800">সম্পাদক ও প্রকাশক:</strong> মোস্তাফিজুর রহমান
              </p>
              <p>
                <strong className="text-slate-800">নির্বাহী সম্পাদক:</strong> ড. তানভীর আহমেদ
              </p>
              <p className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>প্রগতি টাওয়ার, ২০-২১ কারওয়ান বাজার বাণিজ্যিক এলাকা, ঢাকা-১২১৫, বাংলাদেশ।</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600 shrink-0" />
                <span>+৮৮০ ২ ৮১৮৯xxx, +৮৮০ ১৭xxxxxxxx</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600 shrink-0" />
                <span>news@aloasbe.com, ads@aloasbe.com</span>
              </p>
            </div>
          </div>

          {/* Quick Categories Column 1 */}
          <div>
            <h4 className="font-serif-bangla text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
              প্রধান বিভাগ
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-red-600 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Categories Column 2 */}
          <div>
            <h4 className="font-serif-bangla text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
              অন্যান্য বিভাগ
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              {categories.slice(5).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-red-600 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <a href="#photo-gallery" className="hover:text-red-600 transition-colors">
                  ছবি গ্যালারি
                </a>
              </li>
              <li>
                <a href="#video-gallery" className="hover:text-red-600 transition-colors">
                  ভিডিও সংবাদ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Newspaper Utilities */}
          <div>
            <h4 className="font-serif-bangla text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <a href="#about" className="hover:text-red-600 transition-colors">
                  আমাদের সম্পর্কে
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-red-600 transition-colors">
                  ব্যবহারের শর্তাবলী
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-red-600 transition-colors">
                  গোপনীয়তা নীতি
                </a>
              </li>
              <li>
                <a href="#advertise" className="hover:text-red-600 transition-colors">
                  বিজ্ঞাপন মূল্যতালিকা
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-red-600 transition-colors">
                  যোগাযোগ ও মতামত
                </a>
              </li>
              <li>
                <a href="#epaper" className="hover:text-red-600 transition-colors font-medium text-red-600">
                  ই-পেপার সংস্করণ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Neutral online edition tagline without copyright or trade license claims */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="font-serif-bangla">
            আলো আসবে — সত্য ও সাহসের অগ্রদূত
          </p>
          <p className="text-slate-400">
            অনলাইন সংস্করণ
          </p>
        </div>
      </div>
    </footer>
  );
}
