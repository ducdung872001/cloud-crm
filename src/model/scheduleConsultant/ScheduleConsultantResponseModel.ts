interface ILstServiceProps {
  id: number;
  name: string;
  avatar: string;
}

export interface IScheduleConsultantResponseModelProps {
  id: number;
  title: string;
  consultantId: number;
  services: string;
  notification: string;
  content: string;
  customerId: number;
  note: string;
  startTime: Date | null;
  endTime: Date | null;
  type: number;
  bsnId?: number;
  consultantName?: string;
  customerName?: string;
  lstService?: ILstServiceProps[];
}
