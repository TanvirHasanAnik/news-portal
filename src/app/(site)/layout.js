import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }) {
  return (
    <>
      {/* 1. Header with Top Ad Banner, Logo, Navigation & Tickers */}
      <Header />

      {/* 2. Main Page Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* 3. Global Newspaper Footer */}
      <Footer />
    </>
  );
}

