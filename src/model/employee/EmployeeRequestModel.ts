export interface IEmployeeFilterRequest {
  name?: string;
  tipType?: number;
  branchId?: number;
  hasShip?: number;
  departmentId?: number;
  page?: number;
  limit?: number;
  LstId?: any;
}

export interface IEmployeeRequest {
  id?: number;
  name?: string;
  phone?: string;
  address?: string;
  jteId?: number;
  managerId?: number;
  status?: number | string;
  viewMode?: number | string;
  viewCustomerMode?: number | string;
  viewContractMode?: number | string;
  viewBusinessPartnerMode?: number | string;
  viewProjectMode?: number | string;
  position?: number;
  userId?: number;
  bsnId?: number;
  serviceCount?: number;
  title?: string;
  isOwner?: number;
  branchId?: number;
  branchName?: string;
  departmentId?: number;
  departmentName?: string;
  avatar?: string;
  sip?: string;
  idToken?: string;
  accessToken?: string;
  uniqueId?: string;
  roles?: string;
  code?: string;
}

export interface ILinkEmployeeUserRequest {
  id: number;
  userId: number;
}
