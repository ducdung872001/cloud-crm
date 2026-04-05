export interface IKpiFilterRequest {
  name?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
}

export interface IKpiRequest {
  name: string;
  description: string;
}
