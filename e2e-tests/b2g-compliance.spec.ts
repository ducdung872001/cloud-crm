import { test, expect } from "@playwright/test";

test.describe("B2G Compliance E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/b2g-compliance");
  });

  test("budget dashboard tab shows categories", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /B2G Compliance/i })).toBeVisible();
    await expect(page.getByText(/Khu Liên Cơ Quan HC Ba Đình/i)).toBeVisible();
    await expect(page.getByText(/Bảo trì kỹ thuật/i)).toBeVisible();
  });

  test("switch to payments tab", async ({ page }) => {
    await page.getByRole("button", { name: /Đề nghị thanh toán/i }).click();
    await expect(page.getByText(/DNTT-2024-001/i)).toBeVisible();
  });

  test("open payment detail with workflow", async ({ page }) => {
    await page.getByRole("button", { name: /Đề nghị thanh toán/i }).click();
    await page.getByRole("button", { name: /Chi tiết/i }).first().click();

    await expect(page.getByText(/Luồng phê duyệt/i)).toBeVisible();
    await expect(page.getByText(/QLDA/i)).toBeVisible();
    await expect(page.getByText(/Kế toán trưởng/i)).toBeVisible();
    await expect(page.getByText(/Kho bạc Nhà nước/i)).toBeVisible();
  });

  test("audit log page accessible", async ({ page }) => {
    await page.goto("/audit-log");
    await expect(page.getByRole("heading", { name: /Audit Log/i })).toBeVisible();
  });

  test("vendor portal preview accessible", async ({ page }) => {
    await page.goto("/vendor-portal-preview");
    await expect(page.getByText(/PREVIEW MODE/i)).toBeVisible();
  });

  test("owner dashboard accessible", async ({ page }) => {
    await page.goto("/owner-dashboard");
    await expect(page.getByText(/Owner Dashboard/i)).toBeVisible();
  });
});
