export interface ITicketProcResponse {
  id: number;
  name: string;
  position: number;
  startDate: string | Date;
  endDate: string | Date;
  branchId?: number;
  status: string | number;
}
