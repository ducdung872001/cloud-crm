export interface IKpiGoalFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IKpiGoalRequest {
  id?: number;
  name: string;
  direction: string;
  position?: number;
  parentId?: number
}
