/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "*.sisko.replit.dev",
    "*.replit.dev",
    "*.repl.co",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.scdn.co" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

module.exports = nextConfig;
