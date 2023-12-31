import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js"
});

export default withSerwist({
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
    config.module.rules.push({
      test: /\.svg$/i,
      // issuer: /\.[jt]sx?$/,
      use: [{ loader: "@svgr/webpack", options: { typescript: true } }]
    });
    return config;
  }
});
