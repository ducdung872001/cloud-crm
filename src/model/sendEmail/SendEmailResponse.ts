export interface ISendEmailResponseModel {
  id: number;
  bsnId?: number;
  content: string;
  emailIndex?: number;
  emails: string;
  employeeId?: number;
  employeeName?: string;
  limit: number;
  page?: number;
  receiverCriteria: string;
  receiverType: number;
  status?: number;
  statusAction?: number;
  templateId: number;
  timeAt: string;
  timeType: number;
  createdTime?: string;
  title: string;
  total?: number;
  isTracked: number;
  recurrenceTime?: any;
}
