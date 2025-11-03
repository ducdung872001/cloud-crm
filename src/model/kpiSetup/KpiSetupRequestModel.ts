export interface IKpiSetupFilterRequest {
  kpiId?: number;
  page?: number;
  limit?: number;
}

export interface IKpiSetupRequest {
  id?: number;
  kpiId?: number;
  goalId?: number;
  threshold?: number;
  weight?: number;  
}
