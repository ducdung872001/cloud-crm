export interface IMaterialImportDetailRequest {
  materialId: number;
  materialName?: string;
  unitName?: string;
  quantity: number;
  price?: number;
  note?: string;
}

export interface IMaterialImportRequest {
  warehouseId: number;
  supplierId?: number;
  supplierName?: string;
  importDate?: string; // yyyy-MM-dd
  note?: string;
  details: IMaterialImportDetailRequest[];
}

export interface IMaterialImportDetailLine {
  id: number;
  materialId: number;
  materialCode?: string;
  materialName: string;
  unitName?: string;
  quantity: number;
  price: number;
  amount: number;
  note?: string;
}

export interface IMaterialImportListItem {
  id: number;
  code: string;
  warehouseId?: number;
  warehouseName?: string;
  supplierId?: number;
  supplierName?: string;
  importDate?: string;
  totalAmount: number;
  lineCount: number;
  status: number;
  statusName: string;
  createdByName?: string;
  createdTime?: string;
}

export interface IMaterialImportDetail extends IMaterialImportListItem {
  note?: string;
  details: IMaterialImportDetailLine[];
}
