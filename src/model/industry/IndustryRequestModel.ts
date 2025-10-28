export interface IIndustryFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IIndustryRequestModel {
  id: number;
  name: string;
  cover: string;
  position: string;
}
