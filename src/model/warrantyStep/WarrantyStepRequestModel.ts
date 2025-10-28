export interface IWarrantyStepFilterRequest {
  procId?: number;
  page?: number;
  limit?: number;
}

export interface IWarrantyStepRequest {
  id?: number;
  departmentId?: number;
  period?: number;
  unit?: string;
  prevId?: number;
  procId?: number;
  divisionMethod?: number;
}
