export interface ITipGroupConfigResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  serviceId: number;
  serviceName: string;
  tip: number | string;
  unit: number | string;

  groupId: number;
  objectType: number;
  objectId: number;
}
