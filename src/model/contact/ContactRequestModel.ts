export interface IContactFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
  listId?: string;
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
  contactExtraInfos: Record<string, unknown>[];
  bsnId: number;
  customers: Record<string, unknown>[];
  emails: string[];
  pipelineId: number | string;
  statusId: number | string;
  cardvisitFront: string;
  cardvisitBack: string;
  department: string;
  coordinators: Record<string, unknown>[];
  primaryCustomerId: number | null;
}

export interface IContactFilterRequest {
  keyword?: string;
  pipelineId?: number;
  statusId?: number;
  customerId?: number;
  page?: number;
  limit?: number;
  type?: number;
  fmtStartEndDate?: string;
  fmtEndEndDate?: string;
}
