export interface ICategoryFilterRequest {
  name: string;
  type?: number;
  page?: number;
  limit?: number;
}

export interface ICategoryRequest {
  id: number;
  name: string;
  code?: string;
  source?: number | string;
  position: number | string;
  type: number | string;
  bsnId: number;
}
