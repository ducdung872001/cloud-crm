export interface ITreamentFilterRequest {
  keyword?: string;
  fmtStartDay?: string;
  fmtEndDay?: string;
  employeeId?: number;
  status?: number;
  page?: number;
  limit?: number;
}

export interface ITreamentUpdateNextRequest {
  id: number;
  fmtScheduleNext: string;
  name: string;
}

export interface ITreamentUpdateCaringEmployeeRequest {
  id: number;
  caringEmployeeId: number;
}

export interface ITreamentFilterByScheduler {
  csrId: number;
}

export interface ITreamentRequest {
  afterProof: string;
  serviceId: number;
  employeeId: number;
  csrId: number;
  fmtScheduleNext: string;
  fmtTreatmentEnd: string;
  fmtTreatmentStart: string;
  note: string;
  prevProof: string;
  procDesc: string;
  treatmentTh: string;
}
