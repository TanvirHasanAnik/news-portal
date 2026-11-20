import Script from "next/script";
import localFont from "next/font/local";
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
  metadataBase: new URL("https://aloashbe.com"),
  title: {
    default: "আলো আসবে - সত্যের পথে, মানুষের সাথে",
    template: "%s | আলো আসবে",
  },
  description:
    "সত্যের পথে, মানুষের সাথে — আলো আসবে। জাতীয়, রাজনীতি, অর্থনীতি, আন্তর্জাতিক, খেলাধুলা, বিনোদন ও প্রযুক্তির সর্বশেষ সংবাদ ও বিশ্লেষণ।",
  openGraph: {
    title: "আলো আসবে - সত্যের পথে, মানুষের সাথে",
    description:
      "সত্যের পথে, মানুষের সাথে — জাতীয়, রাজনীতি, অর্থনীতি, আন্তর্জাতিক, খেলাধুলা ও প্রযুক্তির সর্বশেষ সংবাদ।",
    url: "https://aloashbe.com",
    siteName: "আলো আসবে",
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

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${solaimanLipi.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 selection:bg-red-500 selection:text-white flex flex-col">
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
