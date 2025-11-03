export interface ICallCenterResponseModel {
  id: number;
  callId: string;
  callStatus: number;
  type: string;
  extend: string;
  state: string;
  phone: string;
  createdTime: string;
  endTime: string;
  recording: number;
  customerId: number;
  employeeId: number;
  bsnId: number;
  customerAvatar: string;
  customerName: string;
  employeeName: string;
  employeeAvatar: string;
}
