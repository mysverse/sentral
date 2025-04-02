import type { KnipConfig } from "knip";

const config = {
  compilers: {
    css: (text: string) =>
      [...text.matchAll(/(?<=@)(import|plugin)[^;]+/g)]
        .join("\n")
        .replace(/plugin/g, "import")
  },
  ignoreDependencies: [
    "@svgr/webpack",
    "eslint",
    "eslint-config-prettier",
    "eslint-config-next",
    "@next/eslint-plugin-next",
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-react-hooks"
  ],

  entry: ["app/sw.ts"]
} satisfies KnipConfig;

export default config;
