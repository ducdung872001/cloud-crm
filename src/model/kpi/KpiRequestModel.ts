export interface IKpiFilterRequest {
  name?: string;
  startDate?: any;
  endDate?: any;
  page?: number;
  limit?: number;
}

export interface IKpiRequest {
  name: string;
  description: string;
}
