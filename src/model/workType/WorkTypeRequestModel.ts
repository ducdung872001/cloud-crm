export interface IWorkTypeFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IWorkTypeRequest {
  id: number;
  name: string;
  position: number;
}
