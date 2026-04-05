export interface ITicketProcFilterRequest {
  name?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
  type?: number;
}

export interface ITicketProcRequest {
  name: string;
  position: string | number;
}
