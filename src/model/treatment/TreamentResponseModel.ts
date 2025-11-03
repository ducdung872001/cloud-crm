export interface ITreamentResponse {
  id: number;
  treatmentStart: string;
  treatmentEnd: string;
  scheduleNext: string;
  scheduleProcessed: boolean;
  fmtTreatmentStart?: string;
  fmtTreatmentEnd?: string;
  fmtScheduleNext?: string;
  treatmentTh: number;
  procDesc?: string;
  note?: string;
  serviceId: number;
  employeeId: number;
  caringEmployeeId: number;
  treatmentType?: string;
  prevProof?: string;
  afterProof?: string;
  csrId: number;
  serviceName: string;
  employeeName?: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerGender?: string;
  caringEmployeeName: string;
  totalCall: number;
  totalSuccess: number;
}

export interface ITreamentSchedulerResponse {
  consultantId: number;
  content: string;
  customerAddress?: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  fmtScheduleDate?: string;
  id: number;
  note?: string;
  scheduleDate: string;
  serviceCount?: number;
  status: number;
}
