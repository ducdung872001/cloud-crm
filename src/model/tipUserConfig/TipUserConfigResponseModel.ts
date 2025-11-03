export interface ITipUserConfigResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  serviceId: number;
  serviceName: string;
  tip: number | string;
  unit: number | string;
  effectFrom: number;
  effectTo: number;

  groupId: number;
  objectType: number;
  objectId: number;
}
