export interface IKpiObjectResponse {
  id?: number;
  kayId?: number;
  objectId?: number;
  objectType?: number;
  receiverId?: number;
  assignerId?: number;
  objectName?: string;
  applyName?: string;
  receiverName?: string;  
  assignerName?: string;
  name?: string
}

export interface IKpiExchangeResponseModal {
  id: number;
  content: string;
  contentDelta: string;
  createdTime: string;
  employeeAvatar: string;
  employeeId: number;
  employeeName: string;
  loginEmployeeId: number;
  viewers: any;
  kotId: number;
}
