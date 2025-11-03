export interface IEmailFilterRequest {
  keyword?: string;
  templateId?: number;
  requestId?: number;
  customerId?: number;
  status?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  // đoạn này call api mới
  email?: string;
  ["bsn-id"]?: number;
}

export interface IEmailRequest {
  id?: number;
  name?: string;
  emailFrom?: string;
  emailTo?: string;
  title?: string;
  content?: string;
  customerId?: number;
  branchId?: number;
  bsnId?: number;
}
