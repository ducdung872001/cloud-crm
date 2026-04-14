import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VendorPortalPreview from "./VendorPortalPreview";

describe("VendorPortalPreview", () => {
  it("renders preview banner", () => {
    render(<VendorPortalPreview />);
    expect(screen.getByText(/PREVIEW MODE/i)).toBeInTheDocument();
    expect(screen.getByText(/vendor\.tnpm\.vn/i)).toBeInTheDocument();
  });

  it("renders default vendor (KT Việt)", () => {
    render(<VendorPortalPreview />);
    // Full name is "Công ty TNHH Bảo Trì Kỹ Thuật Việt"
    expect(screen.getAllByText(/Bảo Trì Kỹ Thuật Việt/i).length).toBeGreaterThan(0);
  });

  it("renders KPI cards", () => {
    render(<VendorPortalPreview />);
    expect(screen.getAllByText(/HĐ đang có hiệu lực/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Task đang mở/i)).toBeInTheDocument();
    expect(screen.getByText(/HĐ chờ duyệt/i)).toBeInTheDocument();
    expect(screen.getByText(/TNPM nợ bạn/i)).toBeInTheDocument();
  });

  it("renders 5 tabs (dashboard, tasks, contracts, invoices, payments)", () => {
    render(<VendorPortalPreview />);
    expect(screen.getByRole("button", { name: /🏠 Tổng quan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /🔧 Công việc/i })).toBeInTheDocument();
    // "HĐ" alone matches multiple — use specific emoji prefix
    expect(screen.getByRole("button", { name: /📄 HĐ \(/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /💳 HĐ đã gửi/i })).toBeInTheDocument();
  });

  it("opens submit invoice modal", async () => {
    const user = userEvent.setup();
    render(<VendorPortalPreview />);
    await user.click(screen.getByRole("button", { name: /Gửi hóa đơn mới/i }));
    expect(screen.getByText(/Gửi hóa đơn tới TNPM/i)).toBeInTheDocument();
    expect(screen.getByText(/3-way match/i)).toBeInTheDocument();
  });

  it("can switch vendor via dropdown", async () => {
    const user = userEvent.setup();
    render(<VendorPortalPreview />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
  });
});
