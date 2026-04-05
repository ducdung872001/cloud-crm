export interface IBrandNameResponseModel {
  id: number;
  name: string;
  expiredDate: string;
  partnerId: number;
  partnerName: string;
  partnerConfig: string;
  status?: number | string;
  whitelist?: string;
}
