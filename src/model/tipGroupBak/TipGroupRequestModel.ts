export interface ITipGroupFilterRequest {
  page?: number;
  limit?: number;
}

export interface ITipGroupRequest {
  id: number;
  groupId: number;
  groupName: string;
  serviceId: number | string;
  serviceName: string;
  tip: number | string;
  unit: number | string;
}
