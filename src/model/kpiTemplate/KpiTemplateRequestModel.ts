export interface IKpiTemplateFilterRequest {
  name?: string;
  startDate?: any;
  endDate?: any;
  page?: number;
  limit?: number;
}

export interface IKpiTemplateRequest {
  name: string;
  description: string;
}
