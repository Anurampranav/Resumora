const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.clerk.com" }],
  },
  outputFileTracingRoot: path.join(__dirname, "../"),
};
module.exports = nextConfig;
