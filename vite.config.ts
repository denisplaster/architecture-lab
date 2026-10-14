import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative asset URLs so the built page also works from a file path or a
  // single-file export (see scripts/singlefile.mjs).
  base: "./",
  server: {
    port: 5189,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    target: "es2022",
    // One JS chunk and one CSS file: the single-file export inlines both.
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: 1024 * 1024,
    // The whole app, content included, is one chunk by design.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: { manualChunks: undefined },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"],
    globals: true,
  },
});
