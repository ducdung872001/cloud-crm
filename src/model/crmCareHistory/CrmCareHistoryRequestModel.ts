export interface ICrmCareHistoryRequest {
  id?: number;
  name: string;
  customerId: number;
  employeeId: number;
  campaignId: number;
  status?: number;
  content?: string;
  objectType?: string;
  objectId?: number;
}

export interface ICrmCareHistoryFilterRequest {
  customerId: number;
  employeeId: number;
  objectType?: string;
}
