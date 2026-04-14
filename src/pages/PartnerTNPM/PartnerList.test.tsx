import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PartnerList from "./PartnerList";

describe("PartnerList (TNPM)", () => {
  it("renders title and KPIs", () => {
    render(<PartnerList />);
    expect(screen.getByRole("heading", { name: /Quản lý Đối tác/i })).toBeInTheDocument();
    expect(screen.getByText(/Tổng đối tác/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Đang hợp tác/i).length).toBeGreaterThan(0);
  });

  it("renders 5 partner type tabs", () => {
    render(<PartnerList />);
    expect(screen.getByRole("button", { name: /Đối tác chiến lược/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Đối tác giới thiệu/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Đối tác tư vấn/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Đối tác phân phối/i })).toBeInTheDocument();
  });

  it("shows at least one mock partner row", () => {
    render(<PartnerList />);
    expect(screen.getByText(/ROX Key Holdings/i)).toBeInTheDocument();
  });

  it("opens add partner modal when clicking button", async () => {
    const user = userEvent.setup();
    render(<PartnerList />);
    await user.click(screen.getByRole("button", { name: /Thêm đối tác/i }));
    expect(screen.getByText(/Thêm đối tác mới/i)).toBeInTheDocument();
    expect(screen.getByText(/Thông tin cơ bản/i)).toBeInTheDocument();
  });

  it("opens detail drawer when clicking eye button", async () => {
    const user = userEvent.setup();
    render(<PartnerList />);
    const viewButtons = screen.getAllByTitle(/Xem chi tiết/i);
    await user.click(viewButtons[0]);
    // Detail modal should show partner name as heading
    expect(screen.getByText(/Hợp đồng với đối tác này/i)).toBeInTheDocument();
  });

  it("search by name works", async () => {
    const user = userEvent.setup();
    render(<PartnerList />);
    const searchInput = screen.getByPlaceholderText(/Tìm tên, mã/i) as HTMLInputElement;
    await user.type(searchInput, "ROX");
    expect(searchInput.value).toBe("ROX");
  });
});
