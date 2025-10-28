export interface IProduct {
  id: number;
  name: string;
  short_name?: string;
  product_store_id: number;
  product_category_id?: number;
  product_category_name?: string;
  product_group_id?: number;
  product_group_name?: string;
  is_master_data?: boolean;
  product_code: string;
  description?: string;
  barcode?: string;
  substances?: string;
  concentration?: string;
  country?: string;
  company?: string;
  registry_number?: string;
  package_form?: string;
  image?: string;
  active: "yes" | "no";
  copy_id?: number;
  is_monopoly?: boolean;
  national_product_code?: string;
  sync_at?: string;
  updated_at: string;
  created_at: string;
  warning_days?: number;
  warning_quantity_max?: number;
  warning_quantity_min?: number;
  warning_unit?: number;
  numbers?: INumber[];
  quantity: number;
  current_cost: number;
  main_cost: number;
  unit_name: string;
  unit_id: number;
  units: IUnit[];
}

export interface INumber {
  number: string;
  quantity: number;
  expiry_date: string;
}

export interface IUnit {
  unit_id: number;
  unit_name: string;
  exchange: number;
  is_basic: "yes" | "no";
  current_cost: number;
  main_cost: number;
  quantity: number;
  warning_quantity: number;
}
