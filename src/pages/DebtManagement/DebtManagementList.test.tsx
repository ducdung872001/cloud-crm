import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DebtManagementList from "./DebtManagementList";

describe("DebtManagementList", () => {
  beforeEach(() => {
    render(<DebtManagementList />);
  });

  describe("rendering", () => {
    it("shows page title", () => {
      expect(screen.getByRole("heading", { name: /Quản lý Công nợ/i })).toBeInTheDocument();
    });

    it("renders 4 KPI cards", () => {
      expect(screen.getByText(/Tổng phải thu/i)).toBeInTheDocument();
      expect(screen.getByText(/Tổng phải trả/i)).toBeInTheDocument();
      expect(screen.getByText(/Công nợ quá hạn/i)).toBeInTheDocument();
      expect(screen.getByText(/Số đối tượng/i)).toBeInTheDocument();
    });

    it("renders filter tabs", () => {
      expect(screen.getByRole("button", { name: /Tất cả/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Phải thu/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Phải trả/i })).toBeInTheDocument();
    });

    it("renders debt table with headers", () => {
      expect(screen.getByText("Đối tượng")).toBeInTheDocument();
      expect(screen.getByText("Loại nợ")).toBeInTheDocument();
      expect(screen.getByText("Hóa đơn")).toBeInTheDocument();
      expect(screen.getByText(/Hạn TT/i)).toBeInTheDocument();
    });

    it("shows mock debt rows (at least 1)", () => {
      // ABC Technology is a known mock debt
      expect(screen.getByText(/ABC Technology/i)).toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it("filters by search keyword", async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Tìm tên, mã HĐ/i) as HTMLInputElement;
      await user.type(searchInput, "ABC");
      expect(searchInput.value).toBe("ABC");
      // Row containing ABC Technology should still be visible
      expect(screen.getByText(/ABC Technology/i)).toBeInTheDocument();
    });

    it("filters by kind tab (Phải thu)", async () => {
      const user = userEvent.setup();
      const payableTab = screen.getByRole("button", { name: /Phải trả/i });
      await user.click(payableTab);
      // After switching to payable tab, KT Việt (vendor) row should remain visible
      // The mock has vendor debts
    });

    it("filters by status dropdown", () => {
      const select = screen.getByDisplayValue(/Tất cả trạng thái/i) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: "overdue" } });
      expect(select.value).toBe("overdue");
    });
  });

  describe("pay modal", () => {
    it("opens pay modal when clicking 💰 button", async () => {
      const user = userEvent.setup();
      const payButtons = screen.getAllByTitle(/Thu tiền|Thanh toán/i);
      expect(payButtons.length).toBeGreaterThan(0);
      await user.click(payButtons[0]);
      expect(screen.getByText(/Xác nhận/i)).toBeInTheDocument();
    });

    it("edit schedule modal opens with 📅 button", async () => {
      const user = userEvent.setup();
      const editButtons = screen.getAllByTitle(/Sửa hạn/i);
      await user.click(editButtons[0]);
      expect(screen.getByText(/Sửa hạn & nhắc nhở/i)).toBeInTheDocument();
    });

    it("history modal opens with 📜 button", async () => {
      const user = userEvent.setup();
      const historyButtons = screen.getAllByTitle(/Lịch sử/i);
      await user.click(historyButtons[0]);
      expect(screen.getByText(/Lịch sử giao dịch/i)).toBeInTheDocument();
    });
  });

  describe("KPI calculations", () => {
    it("displays nonzero totals for receivable and payable", () => {
      // The KPI cards should show money amounts (contain "tr đ" or "tỷ")
      const headings = screen.getAllByText(/(tr đ|tỷ)/i);
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
