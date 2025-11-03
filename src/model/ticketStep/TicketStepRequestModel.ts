export interface ITicketStepFilterRequest {
  procId?: number;
  page?: number;
  limit?: number;
}

export interface ITicketStepRequest {
  id?: number;
  departmentId?: number;
  period?: number;
  unit?: string;
  prevId?: number;
  procId?: number;
  divisionMethod?: number;
  employees?: string;
}
