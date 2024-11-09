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
    async redirects() {
      return [
        {
          source: "/dashboard/finsys",
          destination: "/dashboard/simmer/finsys",
          permanent: true
        },
        {
          source: "/dashboard/finsys/admin",
          destination: "/dashboard/simmer/finsys/admin",
          permanent: true
        },
        {
          source: "/dashboard/gentag",
          destination: "/dashboard/simmer/gentag",
          permanent: true
        }
      ];
    },
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
    webpack(config) {
      // Grab the existing rule that handles SVG imports
      const fileLoaderRule = config.module.rules.find((rule) =>
        rule.test?.test?.(".svg")
      );

      config.module.rules.push(
        // Reapply the existing rule, but only for svg imports ending in ?url
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/ // *.svg?url
        },
        // Convert all other *.svg imports to React components
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
          use: ["@svgr/webpack"]
        }
      );

      // Modify the file loader rule to ignore *.svg, since we have it handled now.
      fileLoaderRule.exclude = /\.svg$/i;
      return config;
    }
  })
);
