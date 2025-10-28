export interface IDepartmentFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
  branchId?: number;
}

export interface IDepartmentRequest {
  id?: number;
  name?: string;
  note?: string;
  leadership?: number;
  status?: string;
  jobTitles?: string;
}
