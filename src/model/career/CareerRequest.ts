export interface ICareerFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface ICareerRequest {
  id: number;
  bsnId: number;
  name: string;
  position: number;
  custType: any;
}
