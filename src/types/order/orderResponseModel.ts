interface IDetailsOrderResponse {
  id: number;
  cost: number;
  discount: number;
  discount_rate: number;
  discount_type: string;
  product_code: string;
  product_id: number;
  product_name: string;
  exchange: number;
  expiry_date: string;
  note: string;
  number: string;
  order_id: number;
  quantity: number;
  unit_id: number;
  unit_name: string;
  vat: number;
  warehouse_id: number;
}

export interface IOrderResponseModel {
  id: number;
  orderCode: string;
  orderDate: string;
  amount: number;
  debt_amount: number;
  details: IDetailsOrderResponse[];
  discount: number;
  discount_rate: number;
  discount_type: string;
  expectedDate: string;
  note: string;
  pay_amount: number;
  payment_method: string;
  status: string;
  supplier_id: number;
  supplier: any;
  vat_amount: number;
}

interface INumbersResponse {
  id: number;
  product_id: number;
  created_at: string;
  expiry_date: string;
  manufacturing_date: string;
  name: string;
  number: string;
  quantity: number;
  sale_price: number;
  unit_id: number;
  unit_name: string;
  updated_at: string;
  warning_quantity: number;
}

export interface ISeachOrderproductResponseModel {
  id: number;
  active: string;
  barcode: string;
  company: string;
  concentration: string;
  country: string;
  created_at: string;
  description: string;
  product_code: string;
  expiry_date: string;
  image: string;
  name: string;
  numbers: INumbersResponse[];
  package_form: string;
  registry_number: string;
  short_name: string;
  source: string;
  substances: string;
  unit: { id: number; name: string };
  unit_id: number;
  updated_at: string;
  usage: string;
  vat: number;
}
