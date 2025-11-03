export interface IContactFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IContactFieldFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IContactRequest {
  id: number;
  name: string;
  phone: string;
  note: string;
  avatar: string;
  employeeId: number | string;
  positionId: number | string;
  contactExtraInfos: any; //Thuộc tính thêm
  bsnId: number;
  customers: any;
  emails: any;
  pipelineId: number | string;
  statusId: number | string;
  cardvisitFront: string;
  cardvisitBack: string;
  department: string;
  coordinators: any;
  primaryCustomerId: any;
}

export interface IContactFilterRequest {
  keyword?: string;
  pipelineId?: number;
  statusId?: number;
  customerId?: number;
  page?: number;
  limit?: number;
  type?: number;
  fmtStartEndDate?: any;
  fmtEndEndDate?: any;
}
