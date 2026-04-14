import { test, expect } from "@playwright/test";

test.describe("DebtManagement E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/debt-management");
  });

  test("page loads with KPI cards", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Quản lý Công nợ/i })).toBeVisible();
    await expect(page.getByText(/Tổng phải thu/i)).toBeVisible();
    await expect(page.getByText(/Tổng phải trả/i)).toBeVisible();
  });

  test("filter by kind tab", async ({ page }) => {
    await page.getByRole("button", { name: /^Phải trả/i }).click();
    // Vendor debts should show after filtering
    await expect(page.getByText(/Nhà cung cấp/i).first()).toBeVisible();
  });

  test("open pay modal and fill form", async ({ page }) => {
    // Click first 💰 action button
    await page.locator('button[title*="Thu"], button[title*="Thanh toán"]').first().click();

    await expect(page.getByText(/Xác nhận/i)).toBeVisible();

    // Switch payment method
    await page.locator('select').first().selectOption({ index: 0 });

    // Close modal
    await page.getByRole("button", { name: /Hủy/i }).click();
  });

  test("open history modal", async ({ page }) => {
    await page.locator('button[title="Lịch sử"]').first().click();
    await expect(page.getByText(/Lịch sử giao dịch/i)).toBeVisible();
  });

  test("navigate to Giao dịch công nợ", async ({ page }) => {
    await page.goto("/debt-transaction");
    await expect(page.getByRole("heading", { name: /Giao dịch Công nợ/i })).toBeVisible();
  });

  test("create debt transaction flow", async ({ page }) => {
    await page.goto("/debt-transaction");
    await page.getByRole("button", { name: /\+ Tạo giao dịch/i }).click();

    await expect(page.getByText(/Tạo giao dịch công nợ/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Thu nợ KH/i })).toBeVisible();

    // Cancel
    await page.getByRole("button", { name: /^Hủy$/i }).click();
  });
});
