import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", "e2e-tests"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/pages/DebtManagement/**", "src/pages/PartnerTNPM/**", "src/pages/LeaseContract/**", "src/pages/SettingTNPM/**", "src/pages/PortfolioDashboard/**", "src/pages/B2GCompliance/**", "src/pages/FeeNotification/**", "src/pages/VendorManagement/**", "src/pages/AuditLog/**", "src/pages/VendorPortal/**", "src/pages/OwnerDashboard/**"],
    },
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      assets: path.resolve(__dirname, "./src/assets"),
      components: path.resolve(__dirname, "./src/components"),
      configs: path.resolve(__dirname, "./src/configs"),
      pages: path.resolve(__dirname, "./src/pages"),
      services: path.resolve(__dirname, "./src/services"),
      utils: path.resolve(__dirname, "./src/utils"),
      contexts: path.resolve(__dirname, "./src/contexts"),
      model: path.resolve(__dirname, "./src/model"),
      hooks: path.resolve(__dirname, "./src/hooks"),
    },
  },
});
