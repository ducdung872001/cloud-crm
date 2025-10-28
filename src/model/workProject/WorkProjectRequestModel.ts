export interface IWorkProjectFilterRequest {
  parentId?: number;
  active?: number;
  name?: string;
  page?: number;
  limit?: number;
  employeeId?: number;
  customerId?: string;
}

export interface IWorkProjectRequestModel {
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  description: string;
  participants: string;
  employeeId: number;
  departmentId: number;
  docLink: string;
  parentId: number;
  projectTypes: any;
}
