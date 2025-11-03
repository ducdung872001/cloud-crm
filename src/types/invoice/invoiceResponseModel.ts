import { IProduct } from "types/product/productResponseModel";

export interface IInvoice {
  address?: string;
  amount: number;
  created_at: string;
  created_by?: number;
  created_name?: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  description?: string;
  discount?: number;
  discount_promotion?: number;
  product_store_id: number;
  email?: string;
  id: number;
  image?: string;
  invoice_code: string;
  invoice_type: string;
  is_import: boolean;
  is_order?: boolean;
  order_code?: string;
  method: string;
  number_phone?: string;
  pay_amount: number;
  payment_method?: string;
  payment_status?: string;
  receipt_date?: string;
  ref_invoice_code?: string;
  refer_id?: number;
  sale_id?: number;
  sale_name?: string;
  shipping_status?: string;
  source?: string;
  status?: string;
  supplier_address?: string;
  supplier_email?: string;
  supplier_invoice_code?: string;
  supplier_name?: string;
  supplier_phone?: string;
  supplier_website?: string;
  synced_at?: string;
  updated_at?: string;
  user_fullname?: string;
  user_username?: string;
  vat_amount: number;
  warehouse_action_id?: string;
  has_return?: boolean;
  tax_number?: string;
  total_amount?: number;
  return_amount?: number;
  debt_amount?: number;
  vat?: number;
  has_prescription?: number;
  has_combo?: number;
}

export interface IClinicItem {
  id: number;
  address?: string;
  bhyt?: string;
  caregiver?: string;
  code_invoice?: string;
  created_at: string;
  doctor?: string;
  height?: string;
  id_card?: string;
  invoice_id: number;
  month_old?: number;
  name_patient?: string;
  patient_address?: string;
  patient_code?: string;
  updated_at?: string;
  weight?: number;
  year_old?: number;
}

export interface IInvoiceDetailItem {
  combo_name?: string;
  cost: number;
  created_at: string;
  current_cost: number;
  discount_promotion: number;
  product: IProduct;
  product_code: string;
  product_id: number;
  product_name: string;
  exchange: number;
  expiry_date?: string;
  id: number;
  image?: string;
  invoice_id: number;
  is_gift?: boolean;
  mfg_date?: string;
  note?: string;
  number: string;
  org_cost: number;
  quantity: number;
  unit_id: number;
  unit_name: string;
  updated_at: string;
  usage?: string;
  vat: number;
  warehouse_id?: number;
  warehouse_invoice_id?: number;
  invoice_detail: any;
}

export interface IInvoiceDetail {
  clinic?: IClinicItem[];
  invoice: IInvoice;
  invoice_detail: IInvoiceDetailItem[];
  refund_invoice?: number[];
}
