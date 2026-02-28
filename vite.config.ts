import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  // Helper function to create process.env definitions
  const createProcessEnvDefinitions = (envVars: Record<string, string>) => {
    const definitions: Record<string, string> = {};

    // Define all environment variables used in the application
    const requiredEnvVars = [
      "APP_ENV",
      "APP_API_URL",
      "APP_ADMIN_URL",
      "APP_AUTHENTICATOR_URL",
      "APP_BPM_URL",
      "APP_API_LOCAL",
      "APP_SSO_LINK",
      "APP_CRM_LINK",
      "APP_DOMAIN",
    ];

    // Add all required environment variables
    requiredEnvVars.forEach(varName => {
      definitions[`process.env.${varName}`] = JSON.stringify(envVars[varName] || "");
    });

    // Add NODE_ENV for development/production checks
    definitions["process.env.NODE_ENV"] = JSON.stringify(mode === "development" ? "development" : "production");

    return definitions;
  };

  return {
    plugins: [
      react({
        // Cấu hình cho React
        include: "**/*.{jsx,tsx}",
      }),
      svgr({
        // Cấu hình SVG như webpack @svgr/webpack
        svgrOptions: {
          exportType: "default",
        },
        include: "**/*.svg",
      }),
    ],
    define: createProcessEnvDefinitions(env),

    // Entry point
    root: ".",

    // Public directory
    publicDir: "public",

    // Build configuration
    build: {
      outDir: "bundle",
      emptyOutDir: true,
      sourcemap: mode === "development",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
        output: {
          // Tách code thành chunks
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["@emotion/css", "react-toastify", "react-select"],
          },
        },
      },
      // Cấu hình assets
      assetsDir: "assets",
      copyPublicDir: true,
    },

    worker: {
      format: "es",
      rollupOptions: {
        external: [],
        output: {
          inlineDynamicImports: true,
        },
      },
    },

    // Development server
    server: {
      port: 4000,
      open: true,
      host: true,
    },

    // Resolve configuration
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
      alias: {
        "@": path.resolve(__dirname, "src"),
        // Compatibility với webpack resolve.modules - tất cả import từ src/
        components: path.resolve(__dirname, "src/components"),
        pages: path.resolve(__dirname, "src/pages"),
        hooks: path.resolve(__dirname, "src/hooks"),
        utils: path.resolve(__dirname, "src/utils"),
        types: path.resolve(__dirname, "src/types"),
        services: path.resolve(__dirname, "src/services"),
        store: path.resolve(__dirname, "src/store"),
        constants: path.resolve(__dirname, "src/constants"),
        helpers: path.resolve(__dirname, "src/helpers"),
        assets: path.resolve(__dirname, "src/assets"),
        configs: path.resolve(__dirname, "src/configs"),
        contexts: path.resolve(__dirname, "src/contexts"),
        enums: path.resolve(__dirname, "src/enums"),
        mocks: path.resolve(__dirname, "src/mocks"),
        model: path.resolve(__dirname, "src/model"),
        exports: path.resolve(__dirname, "src/exports"),
        styles: path.resolve(__dirname, "src/styles"),
        template: path.resolve(__dirname, "src/template"),
      },
    },

    // CSS configuration
    css: {
      preprocessorOptions: {
        scss: {
          // Use modern Sass compiler to avoid deprecation warnings
          api: "modern-compiler",
          // Suppress deprecation warnings for legacy features
          silenceDeprecations: ["legacy-js-api", "import", "global-builtin", "color-functions"],
        },
      },
    },

    // Asset handling (thay thế cho webpack loaders)
    assetsInclude: ["**/*.svg?raw"],

    // Optimizations
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
      exclude: [],
    },

    // Environment-specific configurations
    ...(mode === "development" && {
      server: {
        port: 4000,
        open: true,
        host: true,
        hmr: true,
      },
    }),

    ...(mode === "production" && {
      build: {
        outDir: "bundle",
        emptyOutDir: true,
        sourcemap: false,
        minify: "terser",
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      },
    }),
  };
});
