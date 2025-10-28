export interface IPositionFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IPositionRequest {
  id: number;
  name: string;
  position: number | string;
  bsnId: number;
}
