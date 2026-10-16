/// <reference types="vitest" />
import { build, defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Pre-renders the home page into dist/index.html after every production
// build (see scripts/prerender.mjs). Done as a plugin so plain `vite build`
// includes it, whatever build command the host runs.
const prerenderHome = (): Plugin => {
  let isSsrBuild = false;
  return {
    name: "prerender-home",
    apply: "build",
    configResolved(config) {
      isSsrBuild = !!config.build.ssr;
    },
    async closeBundle() {
      if (isSsrBuild) return;
      await build({
        configFile: false,
        logLevel: "warn",
        plugins: [react()],
        build: { ssr: "src/prerender/entry.tsx", outDir: "dist-ssr", emptyOutDir: true },
      });
      const { prerender } = await import("./scripts/prerender.mjs");
      await prerender();
    },
  };
};

export default defineConfig({
  plugins: [react(), prerenderHome()],
  test: {
    globals: true,
    environment: "jsdom",
  },
});
