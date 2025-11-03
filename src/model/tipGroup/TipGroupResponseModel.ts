export interface ITipGroupResponse {
  id: number;
  name: string;
  position: number;
  employeeNum: number;
  tipType?: number;
  objectType?: number;
  objectId?: number;
  groupId?: number;
  serviceId?: number | string;
  tip?: number;
  unit?: number;
}

export interface ITipGroupToTipGroupEmployeeResponse {
  id: number;
  name: string;
  phone: string;
  position: number;
  serviceCount: number;
  status: number;
  title: string;
  leadership: number;
  jteId: number;
  isOwner: number;
  address: string;
  branchId: number;
  branchName: string;
  departmentId: number;
  departmentName: string;
}
