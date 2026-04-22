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
  lstTicketProcess: Record<string, unknown>[];
  status: number;
  executorId: number;
  processId: number;
  // 4 trường nghiệp vụ khiếu nại (thay thế Supporter)
  receivingUnitId?: number;
  receivingUnitName?: string;
  complaintCategory?: string;   // product / service / delivery / price / other
  complaintCategoryName?: string;
  severity?: string;            // low / medium / high / critical
  severityName?: string;
  resolution?: string;
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
