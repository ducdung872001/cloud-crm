import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react({ include: "**/*.{jsx,tsx}" }),
    svgr({ svgrOptions: { exportType: "default" }, include: "**/*.svg" }),
  ],
  server: { port: 4000, open: true, host: true },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      components: path.resolve(__dirname, "src/components"),
      pages: path.resolve(__dirname, "src/pages"),
      hooks: path.resolve(__dirname, "src/hooks"),
      utils: path.resolve(__dirname, "src/utils"),
      types: path.resolve(__dirname, "src/types"),
      assets: path.resolve(__dirname, "src/assets"),
      configs: path.resolve(__dirname, "src/configs"),
      contexts: path.resolve(__dirname, "src/contexts"),
      styles: path.resolve(__dirname, "src/styles"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api", "import", "global-builtin", "color-functions"],
      },
    },
  },
  build: { outDir: "bundle", emptyOutDir: true },
});
