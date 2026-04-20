export interface IScheduleConsultantFilterRequest {
  consultantId?: number;
  startTime?: string;
  endTime?: string;
}

export interface IScheduleConsultantRequestModelProps {
  title: string;
  consultantId: number;
  services: string;
  content: string;
  customerId: number;
  note: string;
  startTime: string;
  endTime: string;
  type: number | string;
  notification: string;
  customerName: string;
  consultantName: string;
  potName: string;
  nodeId: string;
  lstVar: Array<{ key: string; value: string }>;
  potId: number;
  processId: number;
}
