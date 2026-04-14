import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PartnerContractList from "./PartnerContractList";

describe("PartnerContractList", () => {
  it("renders title and KPIs", () => {
    render(<PartnerContractList />);
    expect(screen.getByRole("heading", { name: /Hợp đồng Đối tác/i })).toBeInTheDocument();
    expect(screen.getByText(/Tổng giá trị HĐ/i)).toBeInTheDocument();
    expect(screen.getByText(/HĐ đang hiệu lực/i)).toBeInTheDocument();
    expect(screen.getByText(/Sắp hết hạn/i)).toBeInTheDocument();
  });

  it("renders contract type tabs", () => {
    render(<PartnerContractList />);
    expect(screen.getByRole("button", { name: /Hợp tác chiến lược/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hoa hồng giới thiệu/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tư vấn/i })).toBeInTheDocument();
  });

  it("opens create contract modal", async () => {
    const user = userEvent.setup();
    render(<PartnerContractList />);
    await user.click(screen.getByRole("button", { name: /Tạo hợp đồng/i }));
    expect(screen.getByText(/Tạo hợp đồng đối tác/i)).toBeInTheDocument();
  });

  it("shows mock partner contract rows", () => {
    render(<PartnerContractList />);
    // "BĐS Phát Lộc" is a known mock partner
    expect(screen.getAllByText(/BĐS Phát Lộc/i).length).toBeGreaterThan(0);
  });

  it("filters contracts by partner dropdown", async () => {
    const user = userEvent.setup();
    render(<PartnerContractList />);
    const partnerSelect = screen.getByDisplayValue(/Tất cả đối tác/i) as HTMLSelectElement;
    expect(partnerSelect).toBeInTheDocument();
    // Change selection doesn't crash
    await user.selectOptions(partnerSelect, partnerSelect.options[1]);
  });
});
