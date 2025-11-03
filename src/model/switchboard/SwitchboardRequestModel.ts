export interface ISwitchboardFilterRequest {
  name: string;
  page?: number;
  limit?: number;
}

export interface ISwitchboardRequestModel {
  name: string;
  expiredDate: string;
  partnerId: number;
  partnerConfig: string;
}
