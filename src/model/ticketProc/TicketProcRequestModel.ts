export interface ITicketProcFilterRequest {
  name?: string;
  startDate?: any;
  endDate?: any;
  page?: number;
  limit?: number;
  type?: number;
}

export interface ITicketProcRequest {
  name: string;
  position: string | number;
}
