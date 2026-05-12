/**
 * Capture cả 4 role sequentially + build slideshow + index.html
 *
 * Yêu cầu:
 *   1. Dev server đang chạy (npm run dev) tại http://localhost:4000
 *   2. tests/.auth-state.json hợp lệ (chạy `node tests/login-save.mjs` nếu hết hạn)
 *
 * Usage:
 *   node tests/fitpro-e2e/capture-all.mjs
 *   node tests/fitpro-e2e/capture-all.mjs customer master   (chỉ chọn vài role)
 *
 * Output:
 *   tests/fitpro-e2e/output/<role>/{video/*.webm, screenshots/*.png, manifest.json, index.html}
 *   tests/fitpro-e2e/output/index.html  ← entry point
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALL_ROLES = ["customer", "master", "coach", "admin"];
const args = process.argv.slice(2);
const roles = args.length ? args.filter((r) => ALL_ROLES.includes(r)) : ALL_ROLES;

console.log(`\n🎬 FitPro E2E capture — roles: ${roles.join(", ")}\n${"=".repeat(60)}`);

for (const role of roles) {
  console.log(`\n▶  Capture role: ${role}`);
  const script = path.join(__dirname, `role-${role}.mjs`);
  const res = spawnSync("node", [script], { stdio: "inherit" });
  if (res.status !== 0) {
    console.warn(`⚠  Role ${role} exit code ${res.status} — tiếp tục role sau.`);
  }
}

console.log(`\n${"=".repeat(60)}\n📦 Build slideshow HTML\n`);
const builder = path.join(__dirname, "_lib", "build-slideshow.mjs");
spawnSync("node", [builder, "--all"], { stdio: "inherit" });

console.log(`\n✅ Done. Mở: tests/fitpro-e2e/output/index.html`);
