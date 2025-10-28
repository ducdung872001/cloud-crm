export interface ITipGroupFilterRequest {
  name?: string;
  tipType?: number;
  page?: number;
  limit?: number;
}

export interface ITipGroupRequest {
  id: number;
  name: string;
  position: number | string;  
  tipType: number;  
}

export interface ITipGroupToTipGroupEmployeeFilterRequest {
  groupId: number;
  page?: number;
  limit?: number;
}

export interface ITipGroupToTipGroupEmployeeRequest {
  id?: number;
  name: string;
  phone: string;
  status: number;
  address: string;
}
