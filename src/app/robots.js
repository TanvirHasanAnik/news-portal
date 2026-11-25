export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/images/"],
        disallow: ["/admin/", "/login", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/api/images/"],
        disallow: ["/admin/", "/login", "/api/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/favicon.ico", "/icon.png", "/brand-logo.svg", "/api/images/"],
        disallow: ["/admin/", "/login", "/api/"],
      },
    ],
    sitemap: "https://aloashbe.com/sitemap.xml",
  };
}

