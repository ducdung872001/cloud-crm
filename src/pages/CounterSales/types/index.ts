export interface CartItem {
  id: string;
  variantId: string;
  icon: string;
  avatar?: string;
  image?: string;
  unitName?: string;
  name: string;
  priceLabel?: string;
  price: number;
  unit?: string;
  qty: number;
}

export interface Product {
  id: string;
  icon: string;
  avatar?: string;
  unitName?: string;
  name: string;
  s;
  priceLabel: string;
  price: number;
  stock: number;
  unit: string;
  lowStock?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  initial: string;
  phone: string;
  points: number;
  tier: string;
  color: string;
}

export interface Order {
  id: string;
  code: string;
  source: "offline" | "shopee" | "tiktok" | "website";
  sourceLabel: string;
  status: "pending" | "shipping" | "success" | "cancelled";
  statusLabel: string;
  time: string;
  customer: Customer;
  items: string;
  total: number;
  cancellationReason?: string;
  note?: string;
}

export type TabType = "pos" | "draft" | "orders" | "report";
export type OrderType = "retail" | "wholesale" | "ship";
export type PayMethod = "cash" | "transfer" | "qr" | "momo" | "zalo_pay" | "credit_card";