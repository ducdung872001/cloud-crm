export interface ISwitchboardFilterRequest {
  name: string;
  page?: number;
  limit?: number;
  id?: number;
}

export interface ISwitchboardRequestModel {
  name: string;
  expiredDate: string;
  partnerId: number;
  partnerConfig: string;
}
