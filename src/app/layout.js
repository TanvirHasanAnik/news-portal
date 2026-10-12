import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

const notoSerifBengali = Noto_Serif_Bengali({
  weight: ["400", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-noto-serif-bengali",
  display: "swap",
});

export const metadata = {
  title: "আমাদের সংবাদ | শীর্ষস্থানীয় বাংলা জাতীয় দৈনিক",
  description: "সত্য, নিরপেক্ষ ও বস্তুনিষ্ঠ সংবাদ সবার আগে - জাতীয়, রাজনীতি, আন্তর্জাতিক, অর্থনীতি, খেলাধুলা ও বিনোদনের তাজা খবর।",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${notoSerifBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 selection:bg-red-500 selection:text-white flex flex-col">{children}</body>
    </html>
  );
}
