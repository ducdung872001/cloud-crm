export interface ITipUserResponse {
  id: number;
  position: number;
  employeeName: string;
  tipType?: number;
}

export interface ITipUserToTipUserEmployeeResponse {
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
