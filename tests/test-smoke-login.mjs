/**
 * test-smoke-login.mjs — xác nhận storageState hoạt động, role đã set.
 */
import { createTestRunner } from "./helpers.mjs";

const t = await createTestRunner("SMOKE", "Smoke Login");
await t.login();

// Kiểm tra token + role trong context
const state = await t.page.evaluate(() => ({
  role: localStorage.getItem("SelectedRole"),
  hasPerm: !!localStorage.getItem("permissions"),
  url: location.href,
}));
t.assert("SMOKE-001", !!state.role, `SelectedRole=${state.role}`);
t.assert("SMOKE-002", state.hasPerm, "localStorage.permissions tồn tại");
t.assert("SMOKE-003", state.url.includes("/crm/"), `URL=${state.url}`);

await t.screenshot("dashboard");
await t.done();
