export interface IConfigCodeFilterRequest {
  page?: number;
  limit?: number;
  type?: number;
  name?: string;
}

export interface IConfigCodeRequestModel {
  name: string;
  code: string;
  type: string;
  position: string;
}
