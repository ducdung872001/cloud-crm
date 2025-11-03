export interface ICustomerSMSFilterRequest {
  templateId?: number;
  requestId?: number;
  customerId?: number;
  status?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
