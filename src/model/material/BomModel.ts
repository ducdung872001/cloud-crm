export interface IBomIngredient {
  id?: number;
  materialId: number;
  materialCode?: string;
  materialName: string;
  quantity: number;
  unitName?: string;
  note?: string;
}

export interface IBomResponse {
  id: number;
  code: string;
  productName: string;
  outputQty: number;
  outputUnit?: string;
  version: string;
  status: number;             // 1=active 2=draft 3=inactive
  statusName?: string;
  note?: string;
  ingredientCount?: number;
  ingredients?: IBomIngredient[];
  createdTime?: string;
  updatedTime?: string;
}

export interface IBomUpsertRequest {
  id?: number;
  code?: string;
  productName: string;
  outputQty?: number;
  outputUnit?: string;
  version?: string;
  note?: string;
  status?: number;
  details?: IBomIngredient[];
}

export interface IBomSummaryResponse {
  total: number;
  active: number;
  draft: number;
  inactive: number;
}