export interface ISendSMSFilterRequest {
  query?: string;
  startDate?: string;
  endDate?: string;
  templateId?: number;
  receiverType?: number;
  status?: number;
  statusAction?: number;
  page?: number;
  limit?: number;
}

export interface ISendSMSRequestModel {
  content: string;
  templateId: number;
  receiverType: string;
  receiverCriteria: string;
  limit: number | string;
  timeType: string;
  timeAt: string;
  brandnameId: number;
}
