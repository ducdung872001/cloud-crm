import { describe, it, expect } from "vitest";
import DebtService from "./DebtService";

// DebtService trong test env không có VITE_TNPM_API_URL, nên fallback về mock.
// Các test này verify service contract + mock fallback logic.

describe("DebtService (mock fallback mode)", () => {
  describe("list()", () => {
    it("returns debts array", async () => {
      const res = await DebtService.list();
      expect(res.items.length).toBeGreaterThan(0);
      expect(res.total).toBe(res.items.length);
    });

    it("filters by kind=receivable", async () => {
      const res = await DebtService.list({ kind: "receivable" });
      expect(res.items.every((d) => d.kind === "receivable")).toBe(true);
    });

    it("filters by kind=payable", async () => {
      const res = await DebtService.list({ kind: "payable" });
      expect(res.items.every((d) => d.kind === "payable")).toBe(true);
    });

    it("filters by status=overdue", async () => {
      const res = await DebtService.list({ status: "overdue" });
      expect(res.items.every((d) => d.status === "overdue")).toBe(true);
    });

    it("filters by projectId", async () => {
      const res = await DebtService.list({ projectId: 1 });
      expect(res.items.every((d) => d.projectId === 1)).toBe(true);
    });

    it("filters by keyword (counterparty name)", async () => {
      const res = await DebtService.list({ keyword: "ABC" });
      expect(res.items.every((d) => d.counterpartyName.toLowerCase().includes("abc") || d.refCode.toLowerCase().includes("abc"))).toBe(true);
    });

    it("returns empty when keyword matches nothing", async () => {
      const res = await DebtService.list({ keyword: "XYZ_NOT_EXIST" });
      expect(res.items.length).toBe(0);
    });
  });

  describe("detail()", () => {
    it("returns debt by id", async () => {
      const debt = await DebtService.detail(1);
      expect(debt).not.toBeNull();
      expect(debt!.id).toBe(1);
    });

    it("returns null for non-existent id", async () => {
      const debt = await DebtService.detail(999999);
      expect(debt).toBeNull();
    });
  });

  describe("pay()", () => {
    it("returns remaining amount after partial payment", async () => {
      const debt = await DebtService.detail(1);
      const result = await DebtService.pay(1, {
        amount: 50_000_000,
        methodId: 1,
        fundId: 1,
      });
      expect(result.debtId).toBe(1);
      expect(result.remaining).toBe(Math.max(0, debt!.amount - 50_000_000));
      expect(result.txnRef).toMatch(/^MOCK-PAY-/);
    });

    it("returns 0 remaining when paying full amount", async () => {
      const debt = await DebtService.detail(1);
      const result = await DebtService.pay(1, {
        amount: debt!.amount,
        methodId: 1,
        fundId: 1,
      });
      expect(result.remaining).toBe(0);
    });

    it("rejects when debt not found", async () => {
      await expect(
        DebtService.pay(999999, { amount: 1_000_000, methodId: 1, fundId: 1 })
      ).rejects.toThrow(/not found/i);
    });
  });

  describe("updateSchedule()", () => {
    it("returns updated debt with new dates", async () => {
      const updated = await DebtService.updateSchedule(1, {
        dueDate: "2024-05-01",
        reminderDate: "2024-04-28",
      });
      expect(updated.dueDate).toBe("2024-05-01");
      expect(updated.reminderDate).toBe("2024-04-28");
    });
  });

  describe("listTransactions()", () => {
    it("returns transaction list", async () => {
      const res = await DebtService.listTransactions();
      expect(Array.isArray(res.items)).toBe(true);
    });

    it("filters by type=collect_debt", async () => {
      const res = await DebtService.listTransactions({ type: "collect_debt" });
      expect(res.items.every((t) => t.type === "collect_debt")).toBe(true);
    });
  });

  describe("createTransaction()", () => {
    it("creates a new transaction with generated id", async () => {
      const tx = await DebtService.createTransaction({
        type: "collect_debt",
        counterpartyName: "Test",
        counterpartyType: "customer",
        amount: 1_000_000,
      });
      expect(tx.id).toBeDefined();
      expect(tx.code).toMatch(/^TXN-MOCK-/);
      expect(tx.amount).toBe(1_000_000);
    });
  });
});
