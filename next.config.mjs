import withSerwistInit from "@serwist/next";
import NextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development"
});

export default withBundleAnalyzer(
  withSerwist({
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**.rbxcdn.com"
        },
        {
          protocol: "https",
          hostname: "**.yan3321.com"
        },
        {
          protocol: "https",
          hostname: "**.yan.gg"
        }
      ]
    },
    experimental: {
      turbo: {
        rules: {
          "*.svg": {
            loaders: ["@svgr/webpack"],
            as: "*.js"
          }
        }
      }
    }
  })
);
