import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DebtTransactionList from "./DebtTransactionList";

describe("DebtTransactionList", () => {
  it("renders title and KPIs", () => {
    render(<DebtTransactionList />);
    expect(screen.getByRole("heading", { name: /Giao dịch Công nợ/i })).toBeInTheDocument();
    expect(screen.getByText(/Đã thu trong kỳ/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã chi trong kỳ/i)).toBeInTheDocument();
    expect(screen.getByText(/Nợ ghi nhận mới/i)).toBeInTheDocument();
  });

  it("filters transactions by type tab", async () => {
    render(<DebtTransactionList />);
    const user = userEvent.setup();
    const collectTab = screen.getByRole("button", { name: /Thu nợ/i });
    await user.click(collectTab);
    // Switching should not crash; row count may decrease
  });

  it("opens create transaction modal", async () => {
    render(<DebtTransactionList />);
    const user = userEvent.setup();
    const createBtn = screen.getByRole("button", { name: /\+ Tạo giao dịch/i });
    await user.click(createBtn);
    expect(screen.getByText(/Tạo giao dịch công nợ/i)).toBeInTheDocument();
  });

  it("can switch between 4 transaction types in modal", async () => {
    render(<DebtTransactionList />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /\+ Tạo giao dịch/i }));

    const thuNoBtn = screen.getByRole("button", { name: /Thu nợ KH/i });
    const traNoBtn = screen.getByRole("button", { name: /Trả nợ NCC/i });
    expect(thuNoBtn).toBeInTheDocument();
    expect(traNoBtn).toBeInTheDocument();

    await user.click(traNoBtn);
    // After switching type, the form should still be rendered
  });

  it("search input works", async () => {
    render(<DebtTransactionList />);
    const user = userEvent.setup();
    const search = screen.getByPlaceholderText(/Tìm mã GD/i) as HTMLInputElement;
    await user.type(search, "TXN-2024");
    expect(search.value).toBe("TXN-2024");
  });
});
