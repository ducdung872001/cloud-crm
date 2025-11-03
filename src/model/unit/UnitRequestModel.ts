export interface IUnitFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IUnitRequest {
  id: number;
  name: string;
  position: number | string;
  bsnId: number;
  status: number;
}
