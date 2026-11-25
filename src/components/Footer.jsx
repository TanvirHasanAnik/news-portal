"use client";

import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  COPYRIGHT_TEXT,
  DIRECTOR_LABEL,
  DIRECTOR_NAME,
  OFFICE_ADDRESS,
  OFFICE_LABEL,
  PHONE_LABEL,
  PUBLISHER_LABEL,
  PUBLISHER_NAME,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/config/siteInfo";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import SocialMediaLinks from "./SocialMediaLinks";

export default function Footer({ socialLinks = {} }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white text-slate-600 pt-8 pb-8 border-t-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <Link href="/" className="inline-block group focus:outline-none">
            <img
              src="/brand-logo.svg"
              alt={`${SITE_NAME} (Alo Ashbe) - ${SITE_TAGLINE}`}
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          <div className="flex items-center gap-4 flex-wrap">
            <SocialMediaLinks links={socialLinks} />

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-red-600 text-slate-700 hover:text-white text-xs font-semibold transition-colors border border-slate-200 shadow-xs ml-auto sm:ml-0 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
              <span>উপরে যান</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <p>
                <strong className="text-slate-800">{DIRECTOR_LABEL}:</strong> {DIRECTOR_NAME}
              </p>
              <p>
                <strong className="text-slate-800">{PUBLISHER_LABEL}:</strong> {PUBLISHER_NAME}
              </p>
            </div>
            <p className="flex items-start sm:items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong className="text-slate-800">{OFFICE_LABEL}:</strong> {OFFICE_ADDRESS}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:justify-end">
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="flex items-center gap-1.5 hover:text-red-600 transition-colors"
            >
              <Phone className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong className="text-slate-800">{PHONE_LABEL}:</strong> {CONTACT_PHONE}
              </span>
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-1.5 hover:text-red-600 transition-colors"
            >
              <Mail className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong className="text-slate-800">ইমেইল:</strong> {CONTACT_EMAIL}
              </span>
            </a>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/about"
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              আমাদের সম্পর্কে
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/privacy-policy"
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              গোপনীয়তা নীতি
            </Link>
          </div>
          <p>{COPYRIGHT_TEXT}</p>
        </div>
      </div>
    </footer>
  );
}
