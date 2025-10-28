export interface ICategoryServiceFilterRequest {
  keyword?: string;
  active?: number;
  page?: number;
  limit?: number;
  type?: number;
}

export interface ICategoryServiceRequestModel {
  avatar: string;
  name: string;
  parentId: number;
  position: number | string;
  active: number | string;
  featured: number | string;
}
