export interface IKpiApplyFilterRequest {
  name?: string;
  startDate?: any;
  endDate?: any;
  page?: number;
  limit?: number;
}

export interface IKpiApplyRequest {
  name: string;
  description: string;
}
