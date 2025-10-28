export interface ITicketCategoryFilterRequest {
  name?: string;
  type?: number;
  page?: number;
  limit?: number;
}

export interface ITicketCategoryRequest {
  name: string;
  position: string | number;
  type: string | number;
}
