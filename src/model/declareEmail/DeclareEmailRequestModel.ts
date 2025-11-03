export interface IDeclareEmailFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IDeclareEmailRequestModel {
  email: string;
  name: string;
  password: string;
  partnerId: number;
  bsnId: number;
}
