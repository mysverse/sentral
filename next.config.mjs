import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development"
});

export default withSerwist({
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
