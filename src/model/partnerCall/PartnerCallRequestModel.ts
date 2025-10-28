export interface IPartnerCallFilterRequest {
  name: string;
  page?: number;
  limit?: number;
}

export interface IPartnerCallRequestModel {
  id?: number;
  partnerName: string;
  partnerCode: string;
  partnerConfig: string;
  contactPhone: string;
  contactName: string;
  address: string;
}
