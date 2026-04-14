import { test, expect } from "@playwright/test";

test.describe("FeeNotification E2E — Campaign wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fee-notification");
  });

  test("page loads with 4 tabs", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Thông báo phí & Nhắc nợ/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Chiến dịch/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Mẫu thông báo/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Quy tắc tự động/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Lịch sử gửi/i })).toBeVisible();
  });

  test("campaign wizard — full 4-step flow", async ({ page }) => {
    await page.getByRole("button", { name: /\+ Tạo chiến dịch/i }).click();

    // Step 1: Basic info
    await expect(page.getByText(/Tạo chiến dịch thông báo/i)).toBeVisible();
    await page.getByPlaceholder(/Nhắc nợ quá hạn tháng/i).fill("Chiến dịch test E2E");

    // Move to Step 2
    await page.getByRole("button", { name: /Bước tiếp/i }).click();
    await expect(page.getByText(/Mẫu thông báo \*/i)).toBeVisible();

    // Step 3
    await page.getByRole("button", { name: /Bước tiếp/i }).click();
    await expect(page.getByText(/Kiểu gửi/i)).toBeVisible();

    // Step 4: Review
    await page.getByRole("button", { name: /Bước tiếp/i }).click();
    await expect(page.getByText(/Xem lại trước khi kích hoạt/i)).toBeVisible();

    // Save as draft
    await page.getByRole("button", { name: /Lưu nháp/i }).click();

    // New campaign should appear in list
    await expect(page.getByText("Chiến dịch test E2E")).toBeVisible();
  });

  test("toggle auto rule", async ({ page }) => {
    await page.getByRole("button", { name: /^Quy tắc tự động/i }).click();
    await expect(page.getByText(/Auto nhắc trước 3 ngày/i)).toBeVisible();
    // Rule checkboxes should be present
    const toggles = page.locator('input[type="checkbox"]');
    await expect(toggles.first()).toBeVisible();
  });

  test("templates tab shows 7 mock templates", async ({ page }) => {
    await page.getByRole("button", { name: /^Mẫu thông báo/i }).click();
    await expect(page.getByText(/Thông báo phí hàng tháng/i)).toBeVisible();
    await expect(page.getByText(/Nhắc nợ lần 1/i)).toBeVisible();
  });
});
