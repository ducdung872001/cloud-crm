import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import SettingCAMCharges from "./SettingCAMCharges";

const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("SettingCAMCharges", () => {
  it("renders title", () => {
    renderWithRouter(<SettingCAMCharges />);
    expect(screen.getByRole("heading", { name: /CAM Charges/i })).toBeInTheDocument();
  });

  it("renders 3 KPI cards", () => {
    renderWithRouter(<SettingCAMCharges />);
    expect(screen.getByText(/Dự án áp dụng CAM/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tổng CAM\/tháng/i).length).toBeGreaterThan(0);
  });

  it("renders existing CAM config cards", () => {
    renderWithRouter(<SettingCAMCharges />);
    expect(screen.getByText(/AEON Mall Long Biên/i)).toBeInTheDocument();
  });

  it("opens add CAM config modal", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingCAMCharges />);
    await user.click(screen.getByRole("button", { name: /Thêm cấu hình CAM/i }));
    expect(screen.getByText(/Thêm cấu hình CAM cho dự án/i)).toBeInTheDocument();
    expect(screen.getByText(/Cấu trúc chi phí CAM hàng tháng/i)).toBeInTheDocument();
  });

  it("opens allocation preview modal", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingCAMCharges />);
    const previewBtns = screen.getAllByRole("button", { name: /Preview phân bổ/i });
    await user.click(previewBtns[0]);
    expect(screen.getByText(/Preview phân bổ CAM/i)).toBeInTheDocument();
  });
});
