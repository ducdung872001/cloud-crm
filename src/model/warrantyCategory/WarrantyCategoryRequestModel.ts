export interface IWarrantyCategoryFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
  type?: number;
}

export interface IWarrantyCategoryRequest {
  name: string;
  position: string | number;
}
