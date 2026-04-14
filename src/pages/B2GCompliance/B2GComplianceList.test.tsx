import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import B2GComplianceList from "./B2GComplianceList";

describe("B2GComplianceList", () => {
  it("renders title", () => {
    render(<B2GComplianceList />);
    expect(screen.getByRole("heading", { name: /B2G Compliance/i })).toBeInTheDocument();
  });

  it("renders 5 KPI cards including total budget", () => {
    render(<B2GComplianceList />);
    expect(screen.getByText(/Tổng ngân sách năm/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã sử dụng/i)).toBeInTheDocument();
    expect(screen.getByText(/Còn lại/i)).toBeInTheDocument();
    expect(screen.getByText(/Chờ phê duyệt/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã chi kho bạc/i)).toBeInTheDocument();
  });

  it("renders 3 tabs", () => {
    render(<B2GComplianceList />);
    expect(screen.getByRole("button", { name: /Tổng quan ngân sách/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Đề nghị thanh toán/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ngân sách & phân bổ/i })).toBeInTheDocument();
  });

  it("dashboard tab shows budget categories", () => {
    render(<B2GComplianceList />);
    expect(screen.getByText(/Khu Liên Cơ Quan HC Ba Đình/i)).toBeInTheDocument();
    expect(screen.getByText(/Bảo trì kỹ thuật/i)).toBeInTheDocument();
  });

  it("can switch to payments tab", async () => {
    const user = userEvent.setup();
    render(<B2GComplianceList />);
    await user.click(screen.getByRole("button", { name: /Đề nghị thanh toán/i }));
    expect(screen.getAllByText(/DNTT-2024/i).length).toBeGreaterThan(0);
  });

  it("opens payment detail modal with workflow", async () => {
    const user = userEvent.setup();
    render(<B2GComplianceList />);
    await user.click(screen.getByRole("button", { name: /Đề nghị thanh toán/i }));
    const detailBtns = screen.getAllByRole("button", { name: /Chi tiết/i });
    await user.click(detailBtns[0]);
    expect(screen.getByText(/Luồng phê duyệt/i)).toBeInTheDocument();
  });
});
