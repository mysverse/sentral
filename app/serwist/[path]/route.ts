import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// A revision helps Serwist version a precached page. This
// avoids outdated precached responses being used.
const revision = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ?? crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: "app/sw.ts",
  additionalPrecacheEntries: [
    { url: "/auth/login?source=pwa", revision },
    { url: "/~offline", revision },
    { url: "/img/MYSverse_Sentral_Logo.svg", revision },
    { url: "/img/Roblox_Logo.svg", revision },
  ],
  useNativeEsbuild: true,
});
