import { defineConfig, loadEnv, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// Plugin: redirect all .svg imports to .svg?react so vite-plugin-svgr processes them
function svgReactRedirect(): Plugin {
  return {
    name: "svg-react-redirect",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (source.endsWith(".svg")) {
        const resolved = await this.resolve(source + "?react", importer, {
          ...options,
          skipSelf: true,
        });
        return resolved;
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load env file based on mode: .env, .env.development, .env.production, .env.staging
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      svgReactRedirect(),
      react(),
      svgr({
        svgrOptions: { exportType: "default" },
      }),
    ],

    resolve: {
      alias: {
        // Match webpack resolve.modules: [src] — allows `import X from "pages/X"`
        src: path.resolve(__dirname, "src"),
        pages: path.resolve(__dirname, "src/pages"),
        components: path.resolve(__dirname, "src/components"),
        configs: path.resolve(__dirname, "src/configs"),
        services: path.resolve(__dirname, "src/services"),
        utils: path.resolve(__dirname, "src/utils"),
        hooks: path.resolve(__dirname, "src/hooks"),
        contexts: path.resolve(__dirname, "src/contexts"),
        assets: path.resolve(__dirname, "src/assets"),
        styles: path.resolve(__dirname, "src/styles"),
        model: path.resolve(__dirname, "src/model"),
        exports: path.resolve(__dirname, "src/exports"),
        types: path.resolve(__dirname, "src/types"),
        webrtc: path.resolve(__dirname, "src/webrtc"),
        "firebase-config": path.resolve(__dirname, "src/firebase-config.ts"),
        "i18n": path.resolve(__dirname, "src/i18n.ts"),
        "@": path.resolve(__dirname, "src"),
      },
      extensions: [".tsx", ".ts", ".js", ".jsx"],
    },

    optimizeDeps: {
      esbuild: {
        loader: { ".js": "jsx" },
      },
    },

    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["import", "global-builtin", "color-functions"],
        },
      },
    },

    // Expose APP_* and OUTLOOK_* env vars as import.meta.env.*
    envPrefix: ["VITE_", "APP_", "OUTLOOK_"],

    // Map process.env.* → values for compatibility (no need to change all source files)
    define: {
      "process.env.APP_ENV": JSON.stringify(env.APP_ENV),
      "process.env.APP_API_URL": JSON.stringify(env.APP_API_URL),
      "process.env.APP_ADMIN_URL": JSON.stringify(env.APP_ADMIN_URL),
      "process.env.APP_BPM_URL": JSON.stringify(env.APP_BPM_URL),
      "process.env.APP_AUTHENTICATOR_URL": JSON.stringify(env.APP_AUTHENTICATOR_URL),
      "process.env.APP_CRM_LINK": JSON.stringify(env.APP_CRM_LINK),
      "process.env.APP_SSO_LINK": JSON.stringify(env.APP_SSO_LINK),
      "process.env.APP_DOMAIN": JSON.stringify(env.APP_DOMAIN),
      "process.env.APP_API_LOCAL": JSON.stringify(env.APP_API_LOCAL),
      "process.env.APP_LINK": JSON.stringify(env.APP_LINK),
      "process.env.APP_TYPE": JSON.stringify(env.APP_TYPE),
      "process.env.OUTLOOK_EMAIL_REDIRECT": JSON.stringify(env.OUTLOOK_EMAIL_REDIRECT),
    },

    base: "/crm/",

    server: {
      port: 4000,
      open: true,
    },

    build: {
      outDir: "bundle/crm",
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          entryFileNames: "js/[name].[hash].js",
          chunkFileNames: "js/[name].[hash].js",
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || "";
            if (/\.css$/.test(name)) return "css/[name].[hash][extname]";
            if (/\.(wav|mp3)$/.test(name)) return "assets/sounds/[name][extname]";
            return "assets/[name].[hash][extname]";
          },
        },
      },
    },
  };
});
