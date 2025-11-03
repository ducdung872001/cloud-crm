export interface IMailBoxResponseModel {
  id: number;
  title: string;
  content: string;
  contentDelta: string;
  departments: string;
  employees: string;
  attachments: string;
  createdTime: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  branchId: number;
  bsnId: number;
}

export interface IMailboxViewerResponseModel {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
  jteId: number;
  departmentId: number;
  leadership: string;
  status: number;
  position: string;
  isOwner: string;
  userId: number;
  managerId: number;
  serviceCount: string;
  title: string;
  branchName: string;
  departmentName: string;
  branchId: number;
  bsnId: number;
}

export interface IMailboxExchangeResponseModel {
  id: number;
  title: string;
  content: string;
  contentDelta: string;
  departments: string;
  employees: string;
  attachments: string;
  createdTime: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  branchId: number;
  bsnId: number;
}

export interface IListMailboxExchangeResponseModel {
  id: number;
  mailboxId: number;
  employeeId: number;
  userId: number;
  content: string;
  contentDelta: string;
  createdTime: string;
  employeeAvatar: string;
  employeeName: string;
  medias: string;
  readers: string;
  updatedTime: string;
}
