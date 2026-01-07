export interface ITicketFilterRequest {
  name?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  customerPhone?: string;
  customerId?: number;
  page?: number;
  limit?: number;
}

export interface ITicketRequestModel {
  name: string;
  customerId: number;
  employeeId: number;
  departmentId: number;
  startDate: string;
  endDate: string;
  phone: string;
  statusId: number;
  supportId: number;
  content: string;
  contentDelta: string;
  docLink: string;
  executorId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export interface ITicketStatusRequestModel {
  id: number;
  status: number;
}

export interface ITicketProcessRequestModel {
  id?: number;
  executorId: number;
  statusId: number;
  ticketId: number;
}

export interface ITicketExchangeFilterRequestModel {
  ticketId: number;
  page: number;
  limit: number;
}

export interface ITicketExchangeUpdateRequestModel {
  id?: number;
  content: string;
  contentDelta?: string;
  medias: string;
  ticketId: number;
}
