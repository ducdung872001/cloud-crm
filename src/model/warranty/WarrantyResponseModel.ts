export interface IWarrantyResponseModel {
  id?: number;
  code?: number;
  employeeId?: number;
  employeeName?: string;
  employeeUserId?: number;
  departmentId?: number;
  departmentName?: string;
  startDate?: string;
  createdTime?: string;
  endDate?: string;
  reasonId?: number;
  reasonName?: string;
  docLink?: string;
  solution?: string;
  note?: string;
  customerId?: number;
  customerCode?: string;
  customerAvatar?: string;
  customerAddress?: string;
  customerName?: string;
  customerPhone?: string;
  serviceId?: number;
  serviceName?: string;
  status?: number;
  statusId?: number;
  statusName?: string;
  bsnId?: number;
  lstWarrantyProcess?: any;
  executorId?: number;
  processId?: number;
}

export interface IWarrantyViewerResponseModel {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
  jteId: number;
  departmentId: number;
  leadership: string;
  status: number;
  position: number;
  isOwner: number;
  userId: number;
  managerId: number;
  serviceCount: string;
  title: string;
  branchId: number;
  branchName: string;
  departmentName: string;
  bsnId: number;
  receiverId: number;
  executorId: number;
  receptionTime: string;
  completionTime: string;
  statusId: number;
  warrantyId: number;
  receiverName: string;
  executorName: string;
  statusName: string;
  receiverDepartmentName: string;
}

export interface IWarrantyExchangeListResponseModel {
  id?: number;
  content?: string;
  contentDelta?: string;
  createdTime?: string;
  employeeId?: number;
  employeeAvatar?: string;
  employeeName?: string;
  medias?: string;
  readers?: string;
  updatedTime?: string;
  userId?: number;
  warrantyId?: number;
}

export interface IWarrantyCategoryListResponseModel {
  id: number;
  name: string;
  position: number;
  type: number;
  bsnId: number;
}
