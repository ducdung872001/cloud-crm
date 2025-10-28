export interface ISwitchboardResponseModel {
  id: number;
  name: string;
  expiredDate: string;
  partnerId: number;
  partnerName: string;
  partnerConfig: string;
  status?: any;
  whitelist?: any;
  active?: any
}
