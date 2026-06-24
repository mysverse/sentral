import { withSerwist } from "@serwist/turbopack";
import NextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains"
  },
  {
    // camera=(self) is required by the QR scanner in certifier/gentag
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=()"
  }
];

export default withSerwist(
  withBundleAnalyzer({
    cacheComponents: true,
    cacheLife: {
      live: {
        stale: 5,
        revalidate: 15,
        expire: 5 * 60
      },
      rapid: {
        stale: 30,
        revalidate: 60,
        expire: 10 * 60
      },
      dashboard: {
        stale: 60,
        revalidate: 5 * 60,
        expire: 60 * 60
      },
      metadata: {
        stale: 5 * 60,
        revalidate: 60 * 60,
        expire: 24 * 60 * 60
      },
      historical: {
        stale: 60 * 60,
        revalidate: 24 * 60 * 60,
        expire: 7 * 24 * 60 * 60
      }
    },
    experimental: {
      // React ViewTransition support — powers AnimateView page transitions
      viewTransition: true
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: securityHeaders
        }
      ];
    },
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
    },
    turbopack: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js"
        }
      }
    },
    outputFileTracingIncludes: {
      "/api/certifier/[id]": ["./public/fonts/**/*"],
      "/verify/[id]/opengraph-image": ["./public/fonts/**/*"]
    }
  })
);
