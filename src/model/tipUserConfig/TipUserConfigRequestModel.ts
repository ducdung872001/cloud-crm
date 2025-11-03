export interface ITipUserConfigFilterRequest {  
  name?: string;
  page?: number;
  limit?: number;
}

export interface ITipUserConfigRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  serviceId: number;
  serviceName: string;
  tip: number | string;
  unit: number | string;
  groupId?: number;  
}
