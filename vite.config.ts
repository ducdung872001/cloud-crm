import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
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
      services: path.resolve(__dirname, "src/services"),
      model: path.resolve(__dirname, "src/model"),
      exports: path.resolve(__dirname, "src/exports"),
      webrtc: path.resolve(__dirname, "src/webrtc"),
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
  envPrefix: ["VITE_", "APP_", "OUTLOOK_"],
  define: {
    "process.env.APP_API_URL": JSON.stringify(env.APP_API_URL ?? ""),
    "process.env.APP_ADMIN_URL": JSON.stringify(env.APP_ADMIN_URL ?? ""),
    "process.env.APP_BPM_URL": JSON.stringify(env.APP_BPM_URL ?? ""),
    "process.env.APP_AUTHENTICATOR_URL": JSON.stringify(env.APP_AUTHENTICATOR_URL ?? ""),
    "process.env.APP_BIZ_URL": JSON.stringify(env.APP_BIZ_URL ?? ""),
    "process.env.APP_CRM_LINK": JSON.stringify(env.APP_CRM_LINK ?? ""),
    "process.env.APP_SSO_LINK": JSON.stringify(env.APP_SSO_LINK ?? ""),
    "process.env.APP_DOMAIN": JSON.stringify(env.APP_DOMAIN ?? ""),
    "process.env.APP_ENV": JSON.stringify(env.APP_ENV ?? ""),
    "process.env.APP_LINK": JSON.stringify(env.APP_LINK ?? ""),
    "process.env.APP_TYPE": JSON.stringify(env.APP_TYPE ?? ""),
  },
  build: { outDir: "bundle", emptyOutDir: true },
  }
});
