export interface IOrderFilterRequest {
  keyword: string;
  page?: number;
  limit?: number;
  page_size?: number;
  type_export?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
  date?: string;
}

export interface IOrderSearchProductFilterRequest {
  keyword: string;
  page?: number;
  per_page?: number;
  is_inventory?: boolean;
  scroll_id?: string;
  is_product?: boolean;
}

interface IOrderDetails {
  id: number;
  product_id: number;
  unit_id: number;
  quantity: number;
  warehouse_id: number;
  cost: number;
  vat: number;
  note: string;
  discount: number;
  discount_type: string;
  discount_rate: number;
  exchange: number;
}
export interface IOrderRequest {
  supplier_id: number;
  order_date: string;
  expected_date: string;
  note: string;
  payment_method: string;
  status: string;
  pay_amount: number;
  debt_amount: number;
  amount: number;
  vat_amount: number;
  discount: number;
  discount_type: string;
  discount_rate: number;
  details: IOrderDetails[];
}

export interface IUpdateStatusOrder {
  id: number;
  status: string;
}
