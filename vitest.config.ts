import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Root vitest config cho Reborn Retail CRM.
 *
 * ⚠️ Không extend vite.config.ts vì vitest 1.6 có conflict CJS/ESM khi load
 * vite.config.ts (react plugin là ESM-only). Config này tự chứa, chỉ có
 * những gì vitest cần.
 *
 * Chạy:
 *   npm test              — chạy 1 lần
 *   npm run test:watch    — watch mode
 *   npm run test:ui       — vitest UI
 *
 * Quy ước test file:
 *   *.test.ts hoặc *.test.tsx ở bất kỳ đâu trong src/
 *   Ưu tiên đặt cạnh file cần test: foo.ts + foo.test.ts
 *   Hoặc trong __tests__/ folder
 */
export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "node_modules/**",
      "dist/**",
      // Exclude module-specific configs đã có riêng
      "src/modules/tax/domain/__tests__/vitest.tax.config.ts",
    ],
    environment: "node", // default env — JSX tests có thể override bằng // @vitest-environment jsdom
    globals: false,
    watch: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
