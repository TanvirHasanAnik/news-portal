import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
  title: "আমাদের সংবাদ | শীর্ষস্থানীয় বাংলা জাতীয় দৈনিক",
  description: "সত্য, নিরপেক্ষ ও বস্তুনিষ্ঠ সংবাদ সবার আগে - জাতীয়, রাজনীতি, আন্তর্জাতিক, অর্থনীতি, খেলাধুলা ও বিনোদনের তাজা খবর।",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${solaimanLipi.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 selection:bg-red-500 selection:text-white flex flex-col">
        {/* 1. Header with Top Ad Banner, Logo, Navigation & Tickers */}
        <Header />

        {/* 2. Main Page Content (Preserved across shared layout navigation) */}
        <div className="flex-1">
          {children}
        </div>

        {/* 3. Global Newspaper Footer */}
        <Footer />
      </body>
    </html>
  );
}

