import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KpiCard, KpiRow, PageHeader, TabBar, ModalShell, ConfirmDialog, StatusBadge, fmtMoney, daysUntil } from "./index";

describe("tnpm shared components", () => {
  describe("KpiCard", () => {
    it("renders label, value, sub, icon", () => {
      render(<KpiCard label="Doanh thu" value="120 tr đ" sub="tháng này" color="#1890ff" icon="💰" />);
      expect(screen.getByText("Doanh thu")).toBeInTheDocument();
      expect(screen.getByText("120 tr đ")).toBeInTheDocument();
      expect(screen.getByText("tháng này")).toBeInTheDocument();
      expect(screen.getByText("💰")).toBeInTheDocument();
    });

    it("renders status corner badge when provided", () => {
      render(<KpiCard label="SLA" value="98%" color="#52c41a" status="ĐẠT" />);
      expect(screen.getByText("ĐẠT")).toBeInTheDocument();
    });
  });

  describe("KpiRow", () => {
    it("renders multiple KPI cards in grid", () => {
      const items = [
        { label: "A", value: 1, color: "#1890ff" },
        { label: "B", value: 2, color: "#52c41a" },
        { label: "C", value: 3, color: "#ff4d4f" },
      ];
      render(<KpiRow items={items} columns={3} />);
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
      expect(screen.getByText("C")).toBeInTheDocument();
    });
  });

  describe("PageHeader", () => {
    it("renders title + subtitle + actions", () => {
      render(
        <PageHeader
          title="Test Title"
          subtitle="subtitle here"
          actions={<button>Action</button>}
        />
      );
      expect(screen.getByRole("heading", { name: /Test Title/i })).toBeInTheDocument();
      expect(screen.getByText("subtitle here")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Action/i })).toBeInTheDocument();
    });

    it("renders back link when provided", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<PageHeader title="Title" backLink={{ label: "Back", onClick }} />);
      await user.click(screen.getByRole("button", { name: /Back/i }));
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("TabBar", () => {
    it("renders tabs with counts and highlights active", () => {
      const onChange = vi.fn();
      render(
        <TabBar
          tabs={[
            { key: "a", label: "A", count: 5 },
            { key: "b", label: "B", count: 10 },
          ]}
          active="a"
          onChange={onChange}
        />
      );
      expect(screen.getByRole("button", { name: /A/i })).toBeInTheDocument();
      expect(screen.getByText("(5)")).toBeInTheDocument();
      expect(screen.getByText("(10)")).toBeInTheDocument();
    });

    it("calls onChange when tab clicked", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(
        <TabBar
          tabs={[{ key: "a", label: "A" }, { key: "b", label: "B" }]}
          active="a"
          onChange={onChange}
        />
      );
      await user.click(screen.getByRole("button", { name: /B/i }));
      expect(onChange).toHaveBeenCalledWith("b");
    });

    it("renders rightSlot", () => {
      render(
        <TabBar
          tabs={[{ key: "a", label: "A" }]}
          active="a"
          onChange={() => {}}
          rightSlot={<input placeholder="search" />}
        />
      );
      expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
    });
  });

  describe("ModalShell", () => {
    it("renders title, children, footer", () => {
      render(
        <ModalShell title="Test Modal" onClose={() => {}} footer={<button>Save</button>}>
          <p>Modal content</p>
        </ModalShell>
      );
      expect(screen.getByRole("heading", { name: /Test Modal/i })).toBeInTheDocument();
      expect(screen.getByText("Modal content")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    });

    it("close button triggers onClose", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(
        <ModalShell title="Test" onClose={onClose}>
          content
        </ModalShell>
      );
      await user.click(screen.getByRole("button", { name: /×/ }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("ConfirmDialog", () => {
    it("renders title, message, confirm/cancel buttons", () => {
      render(
        <ConfirmDialog
          title="Xóa hợp đồng"
          message="Bạn có chắc chắn?"
          onCancel={() => {}}
          onConfirm={() => {}}
        />
      );
      expect(screen.getByText(/Xóa hợp đồng/i)).toBeInTheDocument();
      expect(screen.getByText(/Bạn có chắc chắn/i)).toBeInTheDocument();
    });

    it("onConfirm called when confirm clicked", async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const user = userEvent.setup();
      render(
        <ConfirmDialog
          title="Test"
          message="msg"
          onCancel={onCancel}
          onConfirm={onConfirm}
          confirmLabel="Xóa ngay"
        />
      );
      await user.click(screen.getByRole("button", { name: /Xóa ngay/i }));
      expect(onConfirm).toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe("StatusBadge", () => {
    it("renders label with color background + text", () => {
      render(<StatusBadge label="Đã thanh toán" color="#52c41a" icon="✅" />);
      expect(screen.getByText(/✅ Đã thanh toán/i)).toBeInTheDocument();
    });
  });

  describe("fmtMoney", () => {
    it("formats billion amounts with tỷ suffix", () => {
      expect(fmtMoney(1_500_000_000)).toBe("1.50 tỷ");
    });

    it("formats million amounts with tr đ suffix", () => {
      expect(fmtMoney(2_500_000)).toBe("2.5 tr đ");
    });

    it("formats thousand amounts with full number", () => {
      expect(fmtMoney(500_000)).toMatch(/500.000 đ/);
    });

    it("handles negative numbers", () => {
      expect(fmtMoney(-1_000_000)).toMatch(/^−/);
    });

    it("handles zero", () => {
      expect(fmtMoney(0)).toBe("0 đ");
    });
  });

  describe("daysUntil", () => {
    it("returns null for empty string", () => {
      expect(daysUntil("")).toBeNull();
    });

    it("returns negative for past dates", () => {
      expect(daysUntil("2020-01-01")).toBeLessThan(0);
    });

    it("returns positive for future dates", () => {
      const future = new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0];
      const result = daysUntil(future);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(10);
    });
  });
});
