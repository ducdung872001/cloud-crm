export interface IWarehouseResponse {
  id: number;
  productId: number;
  productName: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  discount: number | null;
  discountUnit: number | null;
  unitId: number;
  unitName: string;
  inventoryName: string;
}
