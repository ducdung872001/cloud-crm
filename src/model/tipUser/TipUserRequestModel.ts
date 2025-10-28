export interface ITipUserFilterRequest {
  name?: string;
  tipType?: number;
  page?: number;
  limit?: number;
}

export interface ITipUserRequest {
  id: number;
  name: string;
  position: number | string;  
  tipType: number;  
}

export interface ITipUserToTipUserEmployeeFilterRequest {
  groupId: number;
  page?: number;
  limit?: number;
}

export interface ITipUserToTipUserEmployeeRequest {
  id?: number;
  name: string;
  phone: string;
  status: number;
  address: string;
}
