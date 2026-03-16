export interface IBomIngredient {
  materialId: number;
  materialCode: string;
  materialName: string;
  qty: number;
  unit: string;
  note?: string;
}

export interface IBomResponse {
  id: number;
  code: string;
  productName: string;
  outputQty: number;
  outputUnit: string;
  version: string;
  status: "active" | "draft" | "inactive";
  ingredients: IBomIngredient[];
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}
