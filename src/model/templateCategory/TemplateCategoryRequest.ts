export interface ITemplateCategoryFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface ITemplateCategoryRequestModel {
  name: string;
  position: number | string;
}
