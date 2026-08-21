const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.clerk.com" }],
  },
  outputFileTracingRoot: path.join(__dirname, "../"),
  async rewrites() {
    return [
      { source: "/login", destination: "/sign-in" },
      { source: "/signup", destination: "/sign-up" },
    ];
  },
};
module.exports = nextConfig;
