export interface ICustomerEmailFilterRequest {
  templateId?: number;
  requestId?: number;
  customerId?: number;
  status?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
