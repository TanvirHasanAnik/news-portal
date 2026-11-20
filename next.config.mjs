import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig = {
  htmlLimitedBots:
    /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot/i,
  reactCompiler: true,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
