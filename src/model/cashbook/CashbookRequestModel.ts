export interface ICashbookFilterRequest {
  categoryId?: number;
  keyword?: string;
  fromTime?: string;
  toTime?: string;
  branchId?: number;
  page?: number;
  limit?: number;
  type?: number;
  template?: string;
  projectId?: number;
}

export interface ICashbookRequest {
  id?: number;
  fmtTransDate?: string;
  transDate: string;
  type?: number;
  categoryId?: number;
  categoryName: string;
  employeeId?: number;
  empName: string;
  branchId: number;
  amount: number | string;
  note?: string;
  bill?: string;
  billCode?: string;
  invoiceType?: string;
  invoiceId?: number;
  actionType?: number;
  projectId?: number;
  contractId?: number;
}
