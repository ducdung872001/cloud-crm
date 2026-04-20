export interface ITreatmentHistoryFilterRequest {
  keyword?: string;
  serviceId?: number;
  employeeId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ITreatmentHistoryListByCustomerFilterRequest {
  serviceId?: number;
  customerId: number;
  serviceNumber: string;
  cardNumber: string;
}

export interface ITreatmentHistoryRequestModel {
  treatmentStart: string;
  treatmentEnd: string;
  treatmentTh: number;
  procDesc: string;
  note: string;
  scheduleNext: string;
  prevProof: string;
  afterProof: string;
  serviceId: number;
  employeeId: number;
  caringEmployeeId: number;
  sttId: number;
  customerId: number;
  serviceNumber: string;
  cardNumber: string;
  treatmentNum: number;
  totalTreatment: number;
  commits: string;
  // trường này thêm vào với mục đích cho form cân đối
  customerPhone: string;
}
