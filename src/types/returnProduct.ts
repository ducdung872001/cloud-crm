export type ReturnType = "return" | "exchange";
export type ReturnStatus = "pending" | "processing" | "done" | "cancel";

export interface ReturnProduct {
  id: string;
  code: string;
  time: string;
  customerName: string;
  originalOrderCode: string;
  type: ReturnType;
  productSummary: string;
  refundAmount: number;
  status: ReturnStatus;
  reason: string;
  staffName: string;
  paymentMethod: string;
  note?: string;
}

export interface ReturnProductItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface ReturnStatCard {
  label: string;
  value: string;
  sub: string;
  variant?: "warn" | "success" | "default";
}
