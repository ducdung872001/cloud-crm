import { test, expect } from "@playwright/test";

test.describe("Partner Management E2E", () => {
  test("partners list loads", async ({ page }) => {
    await page.goto("/partners");
    await expect(page.getByRole("heading", { name: /Quản lý Đối tác/i })).toBeVisible();
    await expect(page.getByText(/ROX Key Holdings/i)).toBeVisible();
  });

  test("add new partner flow", async ({ page }) => {
    await page.goto("/partners");
    await page.getByRole("button", { name: /Thêm đối tác/i }).click();

    await expect(page.getByText(/Thêm đối tác mới/i)).toBeVisible();

    // Fill form
    await page.getByLabel("Tên đối tác *").fill("Công ty Test E2E");
    await page.getByLabel("Họ tên *").fill("Nguyễn Văn Test");

    // Save
    await page.getByRole("button", { name: /Lưu đối tác/i }).click();

    // Row should appear
    await expect(page.getByText("Công ty Test E2E")).toBeVisible();
  });

  test("partner detail drawer shows contracts", async ({ page }) => {
    await page.goto("/partners");
    // Click first view button
    await page.locator('button[title="Xem chi tiết"]').first().click();
    await expect(page.getByText(/Hợp đồng với đối tác này/i)).toBeVisible();
  });

  test("partner contracts page loads", async ({ page }) => {
    await page.goto("/partner-contracts");
    await expect(page.getByRole("heading", { name: /Hợp đồng Đối tác/i })).toBeVisible();
  });

  test("create partner contract modal opens", async ({ page }) => {
    await page.goto("/partner-contracts");
    await page.getByRole("button", { name: /Tạo hợp đồng/i }).click();
    await expect(page.getByText(/Tạo hợp đồng đối tác/i)).toBeVisible();
    await expect(page.getByText(/Thông tin chung/i)).toBeVisible();
  });
});
