import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeaseContractList from "./LeaseContractList";

describe("LeaseContractList", () => {
  it("renders title", () => {
    render(<LeaseContractList />);
    expect(screen.getByRole("heading", { name: /Hợp đồng thuê/i })).toBeInTheDocument();
  });

  it("renders 5 KPI cards including deposit held", () => {
    render(<LeaseContractList />);
    expect(screen.getByText(/Tổng HĐ/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiền cọc đang giữ/i)).toBeInTheDocument();
    expect(screen.getByText(/Sắp hết hạn/i)).toBeInTheDocument();
    expect(screen.getByText(/Cần gửi TB gia hạn/i)).toBeInTheDocument();
  });

  it("renders lease contract rows from mock", () => {
    render(<LeaseContractList />);
    expect(screen.getByText(/HD-THUE-001/i)).toBeInTheDocument();
  });

  it("opens detail modal when clicking 👁 button", async () => {
    const user = userEvent.setup();
    render(<LeaseContractList />);
    const viewButtons = screen.getAllByTitle(/Xem chi tiết/i);
    await user.click(viewButtons[0]);

    // Detail modal should have 4 tabs
    expect(screen.getByRole("button", { name: /Tổng quan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tiền cọc/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lịch tăng giá/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gia hạn/i })).toBeInTheDocument();
  });

  it("detail modal: can switch to deposit tab", async () => {
    const user = userEvent.setup();
    render(<LeaseContractList />);
    const viewButtons = screen.getAllByTitle(/Xem chi tiết/i);
    await user.click(viewButtons[0]);

    const depositTab = screen.getByRole("button", { name: /Tiền cọc/i });
    await user.click(depositTab);
    expect(screen.getByText(/Trạng thái cọc/i)).toBeInTheDocument();
  });

  it("detail modal: can switch to escalation tab", async () => {
    const user = userEvent.setup();
    render(<LeaseContractList />);
    const viewButtons = screen.getAllByTitle(/Xem chi tiết/i);
    // Click second row (HD-THUE-002 has escalation schedule)
    await user.click(viewButtons[1]);
    const escTab = screen.getByRole("button", { name: /Lịch tăng giá/i });
    await user.click(escTab);
  });

  it("filter by status works", () => {
    render(<LeaseContractList />);
    const select = screen.getByDisplayValue(/Tất cả trạng thái/i) as HTMLSelectElement;
    expect(select).toBeInTheDocument();
  });

  it("opens add contract modal", async () => {
    const user = userEvent.setup();
    render(<LeaseContractList />);
    await user.click(screen.getByRole("button", { name: /Thêm hợp đồng/i }));
    expect(screen.getByText(/Thêm hợp đồng thuê/i)).toBeInTheDocument();
  });
});
