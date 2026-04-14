import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VendorKPIDashboard from "./VendorKPIDashboard";

describe("VendorKPIDashboard", () => {
  it("renders title", () => {
    render(<VendorKPIDashboard />);
    expect(screen.getByRole("heading", { name: /Vendor KPI Dashboard/i })).toBeInTheDocument();
  });

  it("shows HLD target KPIs", () => {
    render(<VendorKPIDashboard />);
    expect(screen.getByText(/SLA met trung bình/i)).toBeInTheDocument();
    expect(screen.getByText(/Thời gian duyệt TT TB/i)).toBeInTheDocument();
    expect(screen.getByText(/Rating NCC trung bình/i)).toBeInTheDocument();
  });

  it("renders target badges (ĐẠT / CHƯA ĐẠT)", () => {
    render(<VendorKPIDashboard />);
    // At least one of these should appear
    const badges = screen.queryAllByText(/ĐẠT|CHƯA ĐẠT/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it("renders vendor ranking table", () => {
    render(<VendorKPIDashboard />);
    expect(screen.getAllByText(/Bảng xếp hạng NCC/i).length).toBeGreaterThan(0);
    // At least 1 vendor row — use text search within table
    expect(screen.getAllByText(/Bảo Trì Kỹ Thuật Việt/i).length).toBeGreaterThan(0);
  });

  it("shows scoring formula explanation", () => {
    render(<VendorKPIDashboard />);
    expect(screen.getByText(/Công thức điểm tổng/i)).toBeInTheDocument();
  });
});
