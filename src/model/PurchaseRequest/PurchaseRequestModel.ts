export interface IPurchaseFilterRequest {
  name?: string;
  status?: number;
  coverageStart?: string;
  coverageEnd?: string;
  customerId?: number;
  customerPhone?: string;
  page?: number;
  limit?: number;
  type?: number;
}

export interface IPurchaseRequestModel {
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
}

export interface IPurchaseStatusRequestModel {
  id: number;
  status: number;
}

export interface IPurchaseProcessRequestModel {
  name: string;
  requestNo: string;
  departmentId: number | null;
  employeeId: number | null;
  customerId: number | null;
  notes: string;
  processCode?: string;
}

export interface IPurchaseExchangeFilterRequestModel {
  categoryId: number;
  page: number;
  limit: number;
}

export interface IPurchaseExchangeUpdateRequestModel {
  id?: number;
  content: string;
  contentDelta?: string;
  medias: string;
  categoryId: number;
}

export interface IPurchaseRepairRequestModel {
  data: {
    upLoadLink: string;
    content: string;
  };
  potId: number;
}

export interface IPurchaseCategoryFilterRequest {
  name?: string;
  type?: number;
  page?: number;
  limit?: number;
}