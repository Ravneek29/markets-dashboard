/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: './' keeps asset paths relative so the build works on GitHub Pages
// project subpaths (e.g. /todo-app/) as well as on Vercel/Netlify at the root.
export default defineConfig({
  plugins: [react()],
  base: "./",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
    // Exclude Playwright specs from the Vitest run; Playwright runs them.
    exclude: ["e2e/**", "node_modules/**"],
  },
});
