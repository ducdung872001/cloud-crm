export interface IWarrantyProcFilterRequest {
  name?: string;  
  page?: number;
  limit?: number;
}

export interface IWarrantyProcRequest {
  name: string;
  position: string | number;  
}
