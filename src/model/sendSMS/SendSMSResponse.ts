export interface ISendSMSResponseModel {
  id: number;
  brandnameId: number;
  brandName?: string;
  content: string;
  employeeId?: number;
  employeeName?: string;
  limit?: number;
  page?: number;
  receiverCriteria: string;
  receiverType: number;
  status?: number;
  statusAction?: number;
  templateId: number;
  timeAt: string;
  createdTime?: string;
  timeType: number;
  total?: number;
  recurrenceTime?: any;
}
