import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { aboutInHtml } from "./vite/aboutInHtml";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  base: "/",
  build: {
    rollupOptions: {
      // The Privacy notice is its own page, with no JavaScript.
      input: { main: path.resolve(__dirname, "index.html"), privacy: path.resolve(__dirname, "privacy/index.html") },
    },
  },
  test: {
    // Agent worktrees hold full copies of the repo; don't run their tests too.
    exclude: [...configDefaults.exclude, ".claude/**"],
  },
  plugins: [react(), aboutInHtml()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
