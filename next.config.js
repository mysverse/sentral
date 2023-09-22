/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  disable: process.env.NODE_ENV === "development",
  dest: "public"
  // scope: "/app"
});

const nextConfig = withPWA({
  // output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  optimizeFonts: false,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      // issuer: /\.[jt]sx?$/,
      use: [{ loader: "@svgr/webpack", options: { typescript: true } }]
    });
    return config;
  }
});

module.exports = nextConfig;
