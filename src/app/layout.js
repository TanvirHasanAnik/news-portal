import Script from "next/script";
import localFont from "next/font/local";
import {
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_URL,
  SITE_ALTERNATE_NAMES,
  SITE_KEYWORDS,
} from "@/config/siteInfo";
import "./globals.css";

const solaimanLipi = localFont({
  src: [
    {
      path: "../fonts/SolaimanLipi-Normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SolaimanLipi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-solaiman-lipi",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: `${SITE_NAME} (Alo Ashbe)`,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/icon.png",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: `${SITE_NAME} | Alo Ashbe`,
    locale: "bn_BD",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
  other: {
    "google-adsense-account": "ca-pub-4867645898526862",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsMediaOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand-logo.svg`,
      },
      sameAs: [
        "https://www.facebook.com/aloashbe",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      description: SITE_DESCRIPTION,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "bn-BD",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${solaimanLipi.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 selection:bg-red-500 selection:text-white flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        {children}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4867645898526862"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
