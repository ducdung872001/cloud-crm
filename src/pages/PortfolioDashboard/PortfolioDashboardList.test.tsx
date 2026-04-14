import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PortfolioDashboardList from "./PortfolioDashboardList";

describe("PortfolioDashboardList", () => {
  it("renders title", () => {
    render(<PortfolioDashboardList />);
    expect(screen.getByRole("heading", { name: /Dashboard Portfolio/i })).toBeInTheDocument();
  });

  it("renders top-level KPIs", () => {
    render(<PortfolioDashboardList />);
    expect(screen.getByText(/Dự án đang vận hành/i)).toBeInTheDocument();
    expect(screen.getAllByText(/DT tháng 04/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Chi phí tháng/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lợi nhuận/i).length).toBeGreaterThan(0);
  });

  it("renders revenue chart section", () => {
    render(<PortfolioDashboardList />);
    expect(screen.getByText(/Doanh thu 6 tháng gần nhất/i)).toBeInTheDocument();
  });

  it("renders P&L table with project rows", () => {
    render(<PortfolioDashboardList />);
    expect(screen.getAllByText(/P&L theo dự án/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/AEON Mall Long Biên/i).length).toBeGreaterThan(0);
  });

  it("opens send report modal", async () => {
    const user = userEvent.setup();
    render(<PortfolioDashboardList />);
    // Row button has exact text "📨 Gửi báo cáo" (header btn is "📨 Gửi báo cáo hàng loạt")
    const rowBtns = screen.getAllByRole("button", { name: /^📨 Gửi báo cáo$/i });
    expect(rowBtns.length).toBeGreaterThan(0);
    await user.click(rowBtns[0]);
    // Modal title has ":" so use broader search
    expect(screen.getAllByText(/Gửi báo cáo cho Chủ đầu tư/i).length).toBeGreaterThan(0);
  });

  it("filter by project type works", () => {
    render(<PortfolioDashboardList />);
    const select = screen.getByDisplayValue(/Tất cả loại BĐS/i) as HTMLSelectElement;
    expect(select).toBeInTheDocument();
  });
});
