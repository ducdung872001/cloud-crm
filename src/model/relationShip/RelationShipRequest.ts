export interface IRelationShipFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IRelationShipRequest {
  id: number;
  employeeId?: string;
  createdTime?: string;
  color?: string;
  colorText?: string;
  bsnId?: number;
  name?: string;
  position?: string;
  updatedTime?: string;
}
