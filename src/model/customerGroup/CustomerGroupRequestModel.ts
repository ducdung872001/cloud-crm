export interface ICustomerGroupFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface ICustomerGroupRequest {
  id: number;
  employeeId: number;
  code: string;
  bsnId: number;
  createdTime: string;
  name: string;
  position: string;
}
