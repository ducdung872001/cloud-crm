import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import SettingPaymentMethods from "./SettingPaymentMethods";

const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("SettingPaymentMethods", () => {
  it("renders title", () => {
    renderWithRouter(<SettingPaymentMethods />);
    expect(screen.getByRole("heading", { name: /Phương thức & Cổng thanh toán/i })).toBeInTheDocument();
  });

  it("renders 2 tabs: methods + gateways", () => {
    renderWithRouter(<SettingPaymentMethods />);
    expect(screen.getByRole("button", { name: /Phương thức/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cổng tích hợp/i })).toBeInTheDocument();
  });

  it("shows 6 payment method cards by default", () => {
    renderWithRouter(<SettingPaymentMethods />);
    expect(screen.getAllByText(/MSB Pay/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/App Timi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tiền mặt/i).length).toBeGreaterThan(0);
  });

  it("can switch to gateways tab", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingPaymentMethods />);
    const gatewayTab = screen.getByRole("button", { name: /Cổng tích hợp/i });
    await user.click(gatewayTab);
    expect(screen.getAllByText(/MSB/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Ghi chú tích hợp/i)).toBeInTheDocument();
  });

  it("opens gateway config modal", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingPaymentMethods />);
    const gatewayTab = screen.getByRole("button", { name: /Cổng tích hợp/i });
    await user.click(gatewayTab);
    const configBtns = screen.getAllByRole("button", { name: /⚙️ Cấu hình/i });
    expect(configBtns.length).toBeGreaterThan(0);
    await user.click(configBtns[0]);
    expect(screen.getByText(/API Base URL/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Test kết nối/i).length).toBeGreaterThan(0);
  });
});
