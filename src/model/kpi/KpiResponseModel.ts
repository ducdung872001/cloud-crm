export interface IKpiResponse {
  id: number;
  name: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  branchId?: number;
}
