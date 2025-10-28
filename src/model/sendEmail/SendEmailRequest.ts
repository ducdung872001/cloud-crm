export interface ISendEmailFilterRequest {
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

export interface ISendEmailRequestModel {
  title: string;
  content: string;
  templateId: number;
  receiverType: string;
  receiverCriteria: string;
  limit: string | number;
  timeType: string;
  timeAt: string;
  emails: string;
  isTracked: number | string;
}
