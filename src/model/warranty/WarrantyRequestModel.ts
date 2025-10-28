export interface IWarrantyFilterRequest {
  departmentId?: number;
  customerId?: number;
  status?: number;
  startDate?: string;
  endDate?: string;
  phone?: string;
  page?: number;
  limit?: number;
}

export interface IWarrantyRequestModel {
  employeeId: number;
  executorId: number;
  departmentId: number;
  startDate: string;
  endDate: string;
  reasonId: number;
  docLink: string;
  solution: string;
  note: string;
  customerId: number;
  serviceId: number;
  statusId?: number;
}

export interface IWarrantyViewerRequestModel {
  id: number;
}

export interface IWarrantyStatusRequestModel {
  id?: number;
  status: number;
}

export interface IWarrantyExchangeUpdateRequestModel {
  id?: number;
  content: string;
  contentDelta?: string;
  medias: string;
  warrantyId: number;
}

export interface IWarrantyExchangeFilterRequestModel {
  warrantyId: number;
  page: number;
  limit: number;
}

export interface IWarrantyCategoryRequestModel {
  type: number;
}

export interface IWarrantyProcessRequestModel {
  id?: number;
  executorId: number;
  completionTime?: string;
  statusId: number;
  warrantyId?: number;
}
