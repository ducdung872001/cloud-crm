export interface IWorkOrderResponseModel {
  id: number;
  name: string;
  content: string;
  contentDelta?: string;
  startTime: string;
  endTime: string;
  workLoad: number;
  workLoadUnit: string;
  wteId: number;
  workTypeName?: string;
  docLink: string;
  projectId: number;
  opportunityId: number;
  projectName?: string;
  opportunityName?: string;
  managerId: number;
  managerName?: string;
  managerAvatar?: string;
  employeeId: number;
  employeeName?: number;
  employeeAvatar?: number;
  participants: string;
  customers: string;
  status: number;
  percent: number;
  priorityLevel: number;
  lstParticipant?: any[];
  lstCustomer?: any[];
  notification: string;
  reviews?: string;
  nodeName?: string;
  iteration?: number;
  scope?: string;
  taskType?: string;
}

export interface IWorkInprogressResponseModal {
  id: number;
  percent: number;
  note: string;
  createdTime: string;
  worId: number;
  employeeId: number;
}

export interface IWorkExchangeResponseModal {
  id: number;
  content: string;
  contentDelta: string;
  createdTime: string;
  employeeAvatar: string;
  employeeId: number;
  employeeName: string;
  loginEmployeeId: number;
  viewers: any;
  worId: number;
}

export interface IWorkOrderDocFile {
  url: string;
  type?: string;
  name?: string;
  size?: number;
}