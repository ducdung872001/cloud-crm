export interface IBrandNameFilterRequest {
  name: string;
  page?: number;
  limit?: number;
}

export interface IBrandNameRequestModel {
  name: string;
  expiredDate: string;
  partnerId: number;
  partnerConfig: string;
}
