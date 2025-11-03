export interface ICampaignFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
  customerId?: number;
}

export interface ICampaignRequestModel {
  code?: string;
  name?: string;
  cover?: string;
  startDate?: string;
  endDate?: string;
  position?: number;
  employeeId?: number;
  divisionMethod?: number | string;
  sales?: string;
  approach?: string;
}
