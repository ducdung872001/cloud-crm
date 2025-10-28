export interface ITransferCallModel {
  customerId: number;
  sib1?: string;
  sib2: string;
}

export interface IMakeCallOTPModel {
  phone: string;
  dataSpeech: string;
}

export interface ICallHistoryListFilterRequest {
  employeeId?: number;
  customerId?: number;
  keyword?: string;
  callStatus?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
