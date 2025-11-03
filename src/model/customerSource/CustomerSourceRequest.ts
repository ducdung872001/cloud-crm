export interface ICustomerSourceFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface ICustomerSourceRequest {
  id: number;
  bsnId?: number;
  name: string;
  type: string | number;
  position: string | number;
}
