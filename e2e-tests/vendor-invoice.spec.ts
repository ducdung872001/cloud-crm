import { test, expect } from "@playwright/test";

test.describe("VendorInvoice 3-way match E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/vendor-invoices");
  });

  test("page loads and shows invoices", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Hóa đơn Nhà cung cấp/i })).toBeVisible();
    await expect(page.getByText(/NVAT-2024-001/i)).toBeVisible();
  });

  test("open 3-way match detail modal", async ({ page }) => {
    await page.locator('button[title="3-way match & workflow"]').first().click();

    // 3 documents shown
    await expect(page.getByText(/Purchase Order/i)).toBeVisible();
    await expect(page.getByText(/Biên bản nghiệm thu/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Invoice/i }).or(page.getByText(/Invoice \(Hóa đơn\)/i))).toBeVisible();

    // 4-step workflow
    await expect(page.getByText(/Kỹ thuật hiện trường/i)).toBeVisible();
    await expect(page.getByText(/Kế toán trưởng/i)).toBeVisible();
    await expect(page.getByText(/Quản lý dự án/i)).toBeVisible();
    await expect(page.getByText(/Chi thanh toán/i)).toBeVisible();
  });

  test("KPI Nhà cung cấp page accessible", async ({ page }) => {
    await page.goto("/vendor-kpi");
    await expect(page.getByRole("heading", { name: /Vendor KPI Dashboard/i })).toBeVisible();
    await expect(page.getByText(/SLA met trung bình/i)).toBeVisible();
  });
});
