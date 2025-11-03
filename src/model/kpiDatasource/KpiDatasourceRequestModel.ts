export interface IKpiDatasourceFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IKpiDatasourceRequest {
  id: number;
  name: string;
  code: string;
  description: string;
  position: number;
  type: number;
}
