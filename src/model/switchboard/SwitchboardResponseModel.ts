export interface ISwitchboardResponseModel {
  id: number;
  name: string;
  expiredDate: string;
  partnerId: number;
  partnerName: string;
  partnerConfig: string;
  status?: number | string;
  whitelist?: string;
  active?: number | boolean
}
