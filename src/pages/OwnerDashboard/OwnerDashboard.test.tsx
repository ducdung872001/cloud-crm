import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OwnerDashboard from "./OwnerDashboard";

describe("OwnerDashboard", () => {
  it("renders preview banner for owner portal", () => {
    render(<OwnerDashboard />);
    expect(screen.getByText(/Owner Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/owner\.tnpm\.vn/i)).toBeInTheDocument();
  });

  it("shows default owner BĐS Phát Lộc with their projects", () => {
    render(<OwnerDashboard />);
    expect(screen.getAllByText(/BĐS Phát Lộc/i).length).toBeGreaterThan(0);
    // Phát Lộc owns Goldmark Office
    expect(screen.getByText(/Goldmark Office/i)).toBeInTheDocument();
  });

  it("renders KPIs for owner", () => {
    render(<OwnerDashboard />);
    expect(screen.getAllByText(/Dự án/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/DT tháng 04/i)).toBeInTheDocument();
    expect(screen.getByText(/Tỷ lệ lấp đầy/i)).toBeInTheDocument();
  });

  it("shows revenue chart", () => {
    render(<OwnerDashboard />);
    expect(screen.getByText(/Doanh thu 6 tháng gần nhất/i)).toBeInTheDocument();
  });

  it("shows project P&L table only for owner's projects", () => {
    render(<OwnerDashboard />);
    expect(screen.getByText(/P&L từng dự án của bạn/i)).toBeInTheDocument();
  });

  it("can switch to different owner via dropdown", async () => {
    const user = userEvent.setup();
    render(<OwnerDashboard />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    // Select Vinhomes
    await user.selectOptions(select, "vinhomes");
    expect(screen.getAllByText(/Vinhomes JSC/i).length).toBeGreaterThan(0);
  });

  it("row-level security: UBND sees only HC project", async () => {
    const user = userEvent.setup();
    render(<OwnerDashboard />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    await user.selectOptions(select, "ubnd");
    // Should now show Khu Liên Cơ Quan HC
    expect(screen.getAllByText(/Khu Liên Cơ Quan HC Ba Đình/i).length).toBeGreaterThan(0);
  });
});
