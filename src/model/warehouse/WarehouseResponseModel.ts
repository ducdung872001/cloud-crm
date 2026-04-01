export interface IWarehouseResponse {
  id: number;
  name: string;
  code: string;
  address: string;
  branchId: number;
  branchName: string | null;
  bsnId: number;
  status: number;
  position: number;
  employeeId: number;
  employeeName: string | null;
  isSelling?: number;
  is_selling?: number;
  createdTime: string;
}

export interface IWarehouseList{
  productName: string;
  batchNo: string;
  expiryDate: string;
  unitName: string;
  quantity: number;
  warehouseName: string;
}
