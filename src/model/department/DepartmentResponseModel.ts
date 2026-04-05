export interface IDepartmentResponse {
  id: number;
  name: string;
  note: string;
  leadership: number;
  status: number;
  jobTitles?: Record<string, unknown>[];
  branchId?: number;
  parentId?: number;
  parentName?: string;
  managerId?: number;
  managerName?: string;
  totalEmployee?: number;
  isSale?: number;
  defaultRedirect?: string;
}
