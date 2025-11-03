export interface ITipGroupConfigFilterRequest {  
  page?: number;
  limit?: number;
}

export interface ITipGroupConfigRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  serviceId: number | string;
  serviceName: string;
  tip: number | string;
  unit: number | string;
  groupId?: number;  
}
