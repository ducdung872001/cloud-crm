export interface IKpiTemplateGoalFilterRequest {
  templateId?: number;
  page?: number;
  limit?: number;
}

export interface IKpiTemplateGoalRequest {
  id?: number;
  templateId?: number;
  goalId?: number;
  threshold?: number;
  weight?: number;  
}
