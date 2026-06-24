import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      components: fileURLToPath(new URL("./components", import.meta.url)),
      lib: fileURLToPath(new URL("./lib", import.meta.url)),
      utils: fileURLToPath(new URL("./utils", import.meta.url)),
      data: fileURLToPath(new URL("./data", import.meta.url)),
      auth: fileURLToPath(new URL("./auth.ts", import.meta.url))
    }
  },
  test: {
    environment: "node",
    clearMocks: true
  }
});
