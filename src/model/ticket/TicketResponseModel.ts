export interface ITicketResponseModel {
  id: number;
  name: string;
  code: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAvatar: string;
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  startDate: string;
  endDate: string;
  phone: string;
  statusId: number;
  statusName: string;
  supportId: number;
  supportName: string;
  content: string;
  contentDelta: string;
  docLink: string;
  bsnId: number;
  createdTime: string;
  creatorAvatar: string;
  creatorId: number;
  creatorName: string;
  creatorUserId: number;
  customerAddress: string;
  customerCode: string;
  lstTicketProcess: any;
  status: number;
  executorId: number;
  processId: number;
}

export interface IViewStatusTicketResponseModel {
  id: number;
  title: string;
  content: string;
  departments: string;
  employees: string;
  attachments: string;
  receiverId: number;
  receptionTime: string;
  executorId: number;
  completionTime: string;
  statusId: number;
  ticketId: number;
  receiverName: string;
  executorName: string;
  statusName: string;
}

export interface ITicketExchangeListResponseModel {
  id?: number;
  content?: string;
  contentDelta?: string;
  createdTime?: string;
  employeeId?: number;
  employeeAvatar?: string;
  employeeName?: string;
  medias?: string;
  readers?: string;
  updatedTime?: string;
  userId?: number;
  ticketId?: number;
}
