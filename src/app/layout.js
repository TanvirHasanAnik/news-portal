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
  title: "আলো আসবে",
  description: "সত্যের পথে, মানুষের সাথে",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${solaimanLipi.variable} font-sans h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4867645898526862"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 selection:bg-red-500 selection:text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
