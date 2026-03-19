export type FinanceScreenId = "tong-quan" | "so-thu-chi" | "hoa-don-vat" | "quan-ly-quy" | "cong-no" | "doi-soat";

export type Fund = {
  id: string;
  name: string;
  icon: string;
  balance: number;
  type: "cash" | "bank" | "ewallet";
  color: "gr" | "bl" | "pu" | "am";
};

export type Tx = {
  id: string;
  date: string;
  grp: string;
  desc: string;
  meta: string;
  cat: string;
  fund: string;
  amount: number;
  type: "thu" | "chi";
  status: "approved" | "pending";
};

export type VatInvoice = {
  id: string;
  date: string;
  customer: string;
  tax: string;
  total: number;
  vat: number;
  status: "issued" | "pending" | "cancelled";
};

export type Debt = {
  id: string;
  partner: string;
  type: "payable" | "receivable";
  amount: number;
  paid: number;
  due: string;
  status: "paid" | "partial" | "overdue";
};

export type BankStmt = {
  date: string;
  ref: string;
  desc: string;
  amount: number;
  type: "thu" | "chi";
  matched: boolean;
};

export type FinanceData = {
  funds: Fund[];
  txs: Tx[];
  invoices: VatInvoice[];
  debts: Debt[];
  bankStmts: BankStmt[];
};

export const formatVnd = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + " VND";

export const shortMoney = (v: number) => {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "T";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  return new Intl.NumberFormat("vi-VN").format(v);
};

export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
