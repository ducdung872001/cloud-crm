import { test, expect } from "@playwright/test";

test.describe("LeaseContract E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lease-contracts");
  });

  test("loads with KPI cards", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Hợp đồng thuê/i })).toBeVisible();
    await expect(page.getByText(/Tiền cọc đang giữ/i)).toBeVisible();
    await expect(page.getByText(/Cần gửi TB gia hạn/i)).toBeVisible();
  });

  test("detail modal with 4 tabs", async ({ page }) => {
    await page.locator('button[title="Xem chi tiết"]').first().click();

    await expect(page.getByRole("button", { name: /Tổng quan/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Tiền cọc/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Lịch tăng giá/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Gia hạn/i })).toBeVisible();
  });

  test("switch between tabs", async ({ page }) => {
    await page.locator('button[title="Xem chi tiết"]').first().click();

    await page.getByRole("button", { name: /^Tiền cọc$/i }).click();
    await expect(page.getByText(/Trạng thái cọc/i)).toBeVisible();

    await page.getByRole("button", { name: /^Gia hạn$/i }).click();
    await expect(page.getByText(/Cơ chế gia hạn/i)).toBeVisible();
  });
});
