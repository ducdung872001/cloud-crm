export interface IScheduleTreatmentFilterRequest {
  keyword?: string;
  employeeId?: number;
  customerId?: number;
  fromTime?: string;
  toTime?: string;
  status?: number;
  branchId?: number;
}

export interface IScheduleTreatmentRequestModal {
  title: string;
  customerId: number;
  services: string;
  employeeId: number;
  participants: string;
  startTime: string;
  endTime: string;
  content: string;
  note: string;
  roomId: number;
  notification: string;
  status: number | string;
  branchId: number;
}
