import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeeNotificationList from "./FeeNotificationList";

describe("FeeNotificationList", () => {
  it("renders title", () => {
    render(<FeeNotificationList />);
    expect(screen.getByRole("heading", { name: /Thông báo phí & Nhắc nợ/i })).toBeInTheDocument();
  });

  it("renders 5 KPI cards", () => {
    render(<FeeNotificationList />);
    expect(screen.getByText(/Đã gửi tháng này/i)).toBeInTheDocument();
    expect(screen.getByText(/Đang lên lịch/i)).toBeInTheDocument();
    expect(screen.getByText(/Quy tắc tự động active/i)).toBeInTheDocument();
    expect(screen.getByText(/KH đang nợ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Mẫu thông báo/i).length).toBeGreaterThan(0);
  });

  it("renders 4 tabs", () => {
    render(<FeeNotificationList />);
    expect(screen.getByRole("button", { name: /^📨 Chiến dịch/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^📝 Mẫu thông báo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^⚡ Quy tắc tự động/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^📜 Lịch sử gửi/i })).toBeInTheDocument();
  });

  it("opens campaign wizard with 4 steps", async () => {
    const user = userEvent.setup();
    render(<FeeNotificationList />);
    await user.click(screen.getByRole("button", { name: /\+ Tạo chiến dịch/i }));
    // Modal title may match other text — use getAllByText
    expect(screen.getAllByText(/Tạo chiến dịch thông báo/i).length).toBeGreaterThan(0);
    // Step labels may appear multiple times (indicator + campaign list rows) — use length assertions
    expect(screen.getAllByText(/Cơ bản/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mẫu \+ Phân khúc/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lịch gửi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Xem lại/i).length).toBeGreaterThan(0);
  });

  it("can navigate campaign wizard step by step", async () => {
    const user = userEvent.setup();
    render(<FeeNotificationList />);
    await user.click(screen.getByRole("button", { name: /\+ Tạo chiến dịch/i }));

    const nameInput = screen.getByPlaceholderText(/Nhắc nợ quá hạn tháng/i) as HTMLInputElement;
    await user.type(nameInput, "Test campaign");

    const nextBtn = screen.getByRole("button", { name: /Bước tiếp/i });
    await user.click(nextBtn);
    // Step 2 should show template selector
    expect(screen.getByText(/Mẫu thông báo \*/i)).toBeInTheDocument();
  });

  it("switches to rules tab and shows auto rules", async () => {
    const user = userEvent.setup();
    render(<FeeNotificationList />);
    await user.click(screen.getByRole("button", { name: /^⚡ Quy tắc tự động/i }));
    expect(screen.getByText(/Auto nhắc trước 3 ngày/i)).toBeInTheDocument();
  });

  it("opens template editor modal", async () => {
    const user = userEvent.setup();
    render(<FeeNotificationList />);
    await user.click(screen.getByRole("button", { name: /Thêm mẫu/i }));
    expect(screen.getByText(/Thêm mẫu thông báo/i)).toBeInTheDocument();
    expect(screen.getByText(/Biến có sẵn/i)).toBeInTheDocument();
  });
});
