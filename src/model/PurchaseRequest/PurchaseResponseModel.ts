export interface IPurchaseResponseModel {
  id: number;
  code: string;
  name: string;
  requestNo: string;
  departmentId: number;
  employeeId: number;
  customerId: number;
  type: string;
  categoryId: number;
  categoryName: string;
  productId: number;
  productName: string;
  status: number;
  notes: string;
  recordingUrl: string;
  docLink: string;
  consultedInfo: string;
  creatorId: number;
  creatorName: string;
  departmentName: string;
  employeeName: string;
  bsnId: number;
  clientId: number;
  qrCode: string;
  potId: string;
  processId: string;
  createdAt: string;
  updatedAt: string;
  productSchemaVersion: string;
  productSchemaSnapshot: string;
  productData: object;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerTaxCode: string;
  riskAddress: string;
  registrationNo: string;
  manufactureYear: number;
  brand: string;
  model: string;
  sumInsured: number;
  coverageStart: Date;
  coverageEnd: Date;
  usagePurpose: string;
  deductible: number;
  priority?: string;
  comapnyName?: string;
}

export interface IViewStatusPurchaseResponseModel {
  id: number;
  title: string;
  content: string;
  departments: string;
  employees: string;
  attachments: string;
  receiverId: number;
  receptionTime: string;
  // executorId: number;
  completionTime: string;
  // statusId: number;
  categoryId: number;
  receiverName: string;
  executorName: string;
  statusName: string;
}

export interface IPurchaseExchangeListResponseModel {
  id?: number;
  content?: string;
  // contentDelta?: string;
  createdTime?: string;
  employeeId?: number;
  employeeAvatar?: string;
  employeeName?: string;
  medias?: string;
  readers?: string;
  updatedTime?: string;
  userId?: number;
  categoryId?: number;
}

export interface IPurchaseRepairResponseModel {
  upLoadLink: string;
  content: string;
}
