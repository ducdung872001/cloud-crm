export interface IPartnerSMSFilterRequest {
  name: string;
  page?: number;
  limit?: number;
}

export interface IPartnerSMSRequestModel {
  id?: number;
  partnerName: string;
  partnerCode: string;
  partnerConfig: string;
  contactPhone: string;
  contactName: string;
  address: string;
}
