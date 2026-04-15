import { defineConfig } from "vitest/config";
import path from "path";

// Dedicated vitest config chỉ cho tax module — không load vite.config.ts
// của project chính (tránh lỗi ESM/CJS conflict).
export default defineConfig({
  test: {
    include: ["src/modules/tax/domain/__tests__/**/*.test.ts"],
    environment: "node",
    globals: false,
    watch: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../../../../src"),
    },
  },
});
