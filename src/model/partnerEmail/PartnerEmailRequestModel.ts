export interface IPartnerEmailFilterRequest {
  name: string;
  page?: number;
  limit?: number;
}

export interface IPartnerEmailRequestModel {
  id?: number;
  partnerName: string;
  partnerCode: string;
  partnerConfig: string;
  contactPhone: string;
  contactName: string;
  address: string;
}
