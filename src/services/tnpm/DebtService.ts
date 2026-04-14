/**
 * DebtService — TNPM payment-service domain
 *
 * Strategy: dùng real API khi sẵn sàng, fallback về MOCK_DEBTS khi API lỗi
 * hoặc env flag `VITE_TNPM_USE_MOCK=1` bật.
 *
 * Khi BE team build xong endpoints (per BACKEND_API_SPEC.md section 6),
 * chỉ cần:
 *  1. Set VITE_TNPM_API_URL=http://api.tnpm.vn trong .env
 *  2. Unset VITE_TNPM_USE_MOCK
 *  3. Test qua MSW integration suite để verify contract match
 */

import { MOCK_DEBTS, MOCK_DEBT_TRANSACTIONS } from "assets/mock/TNPMData";

const API_BASE = (import.meta as any).env?.VITE_TNPM_API_URL || "";
const USE_MOCK = (import.meta as any).env?.VITE_TNPM_USE_MOCK === "1" || !API_BASE;

export interface IDebt {
  id: number;
  kind: "receivable" | "payable";
  refType: string;
  refCode: string;
  counterpartyType: "customer" | "vendor";
  counterpartyId: number;
  counterpartyName: string;
  projectId: number;
  projectName: string;
  originalAmount: number;
  paidAmount: number;
  amount: number;
  dueDate: string;
  reminderDate: string;
  daysRemaining: number;
  status: "overdue" | "upcoming" | "open" | "paid";
  note: string;
  createdAt: string;
}

export interface IDebtFilter {
  kind?: "all" | "receivable" | "payable";
  status?: "all" | "overdue" | "upcoming" | "open";
  projectId?: number | string;
  keyword?: string;
}

export interface IDebtPayRequest {
  amount: number;
  methodId: number;
  fundId: number;
  note?: string;
  transDate?: string;
}

export interface IDebtTransaction {
  id: number;
  code: string;
  type: "collect_debt" | "pay_debt" | "create_receivable" | "create_payable";
  debtId: number | null;
  counterpartyName: string;
  counterpartyType: "customer" | "vendor";
  amount: number;
  paymentMethod: string;
  paymentMethodLabel: string;
  fundName: string;
  transDate: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

// ─── Helper: fetch with fallback ──────────────────────────────────────────
async function tryFetch<T>(path: string, init?: RequestInit, fallback?: () => T): Promise<T> {
  if (USE_MOCK) {
    if (fallback) return fallback();
    throw new Error(`Mock fallback not provided for ${path}`);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message || `API error code ${json.code}`);
    return json.result;
  } catch (e) {
    if (fallback) {
      console.warn(`[DebtService] API failed for ${path}, using mock fallback:`, e);
      return fallback();
    }
    throw e;
  }
}

// ─── Service methods ──────────────────────────────────────────────────────
const DebtService = {
  async list(filter: IDebtFilter = {}): Promise<{ items: IDebt[]; total: number }> {
    const params = new URLSearchParams();
    if (filter.kind && filter.kind !== "all") params.set("kind", filter.kind);
    if (filter.status && filter.status !== "all") params.set("status", filter.status);
    if (filter.projectId) params.set("projectId", String(filter.projectId));
    if (filter.keyword) params.set("keyword", filter.keyword);
    const query = params.toString();

    return tryFetch(
      `/debts${query ? "?" + query : ""}`,
      { method: "GET" },
      () => {
        let items = MOCK_DEBTS as unknown as IDebt[];
        if (filter.kind && filter.kind !== "all") items = items.filter((d) => d.kind === filter.kind);
        if (filter.status && filter.status !== "all") items = items.filter((d) => d.status === filter.status);
        if (filter.projectId) items = items.filter((d) => String(d.projectId) === String(filter.projectId));
        if (filter.keyword) {
          const q = filter.keyword.toLowerCase();
          items = items.filter((d) =>
            d.counterpartyName.toLowerCase().includes(q) || d.refCode.toLowerCase().includes(q)
          );
        }
        return { items, total: items.length };
      }
    );
  },

  async detail(id: number): Promise<IDebt | null> {
    return tryFetch(
      `/debts/${id}`,
      { method: "GET" },
      () => (MOCK_DEBTS as unknown as IDebt[]).find((d) => d.id === id) || null
    );
  },

  async pay(id: number, body: IDebtPayRequest): Promise<{ debtId: number; remaining: number; txnRef: string }> {
    return tryFetch(
      `/debts/${id}/pay`,
      { method: "POST", body: JSON.stringify(body) },
      () => {
        const debt = (MOCK_DEBTS as unknown as IDebt[]).find((d) => d.id === id);
        if (!debt) throw new Error("Debt not found");
        const remaining = Math.max(0, debt.amount - body.amount);
        return { debtId: id, remaining, txnRef: `MOCK-PAY-${Date.now()}` };
      }
    );
  },

  async updateSchedule(
    id: number,
    body: { dueDate: string; reminderDate: string }
  ): Promise<IDebt> {
    return tryFetch(
      `/debts/${id}/schedule`,
      { method: "POST", body: JSON.stringify(body) },
      () => {
        const debt = (MOCK_DEBTS as unknown as IDebt[]).find((d) => d.id === id);
        if (!debt) throw new Error("Debt not found");
        return { ...debt, dueDate: body.dueDate, reminderDate: body.reminderDate };
      }
    );
  },

  async listTransactions(params: { type?: string } = {}): Promise<{ items: IDebtTransaction[] }> {
    const query = new URLSearchParams();
    if (params.type && params.type !== "all") query.set("type", params.type);
    const qs = query.toString();

    return tryFetch(
      `/debt-transactions${qs ? "?" + qs : ""}`,
      { method: "GET" },
      () => {
        let items = MOCK_DEBT_TRANSACTIONS as unknown as IDebtTransaction[];
        if (params.type && params.type !== "all") items = items.filter((t) => t.type === params.type);
        return { items };
      }
    );
  },

  async createTransaction(body: Partial<IDebtTransaction>): Promise<IDebtTransaction> {
    return tryFetch(
      `/debt-transactions`,
      { method: "POST", body: JSON.stringify(body) },
      () => ({
        id: Date.now(),
        code: body.code || `TXN-MOCK-${Date.now()}`,
        type: body.type || "collect_debt",
        debtId: body.debtId || null,
        counterpartyName: body.counterpartyName || "",
        counterpartyType: body.counterpartyType || "customer",
        amount: body.amount || 0,
        paymentMethod: body.paymentMethod || "",
        paymentMethodLabel: body.paymentMethodLabel || "—",
        fundName: body.fundName || "—",
        transDate: body.transDate || new Date().toISOString().split("T")[0],
        note: body.note || "",
        createdBy: "Người dùng hiện tại",
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      } as IDebtTransaction)
    );
  },

  async exportExcel(filter: IDebtFilter = {}): Promise<Blob> {
    if (USE_MOCK) {
      alert("Mock mode: Excel export không hoạt động. Cần backend thật.");
      throw new Error("Excel export requires real backend");
    }
    const res = await fetch(`${API_BASE}/debts/export?${new URLSearchParams(filter as any).toString()}`);
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);
    return res.blob();
  },
};

export default DebtService;
