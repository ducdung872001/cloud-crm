import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuditLogList from "./AuditLogList";

describe("AuditLogList", () => {
  it("renders title", () => {
    render(<AuditLogList />);
    expect(screen.getByRole("heading", { name: /Audit Log/i })).toBeInTheDocument();
  });

  it("renders 5 KPI cards", () => {
    render(<AuditLogList />);
    expect(screen.getAllByText(/Tổng log/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Log hôm nay/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Cảnh báo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Nghiêm trọng/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Cô lập tenant/i)).toBeInTheDocument();
  });

  it("renders category pills", () => {
    render(<AuditLogList />);
    expect(screen.getByRole("button", { name: /Tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Xác thực/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thanh toán/i })).toBeInTheDocument();
  });

  it("shows at least some audit entries", () => {
    render(<AuditLogList />);
    expect(screen.getAllByText(/Nguyễn Giám Đốc/i).length).toBeGreaterThan(0);
  });

  it("filter by severity works", async () => {
    const user = userEvent.setup();
    render(<AuditLogList />);
    const select = screen.getByDisplayValue(/Mọi mức độ/i) as HTMLSelectElement;
    await user.selectOptions(select, "critical");
    expect(select.value).toBe("critical");
  });

  it("search input works", async () => {
    const user = userEvent.setup();
    render(<AuditLogList />);
    const input = screen.getByPlaceholderText(/Tìm theo user/i) as HTMLInputElement;
    await user.type(input, "Giám Đốc");
    expect(input.value).toBe("Giám Đốc");
  });
});
