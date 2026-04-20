export interface IScheduleTreatmentResponseModal {
  id: number;
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
  status: number;
  branchId: number;
}
