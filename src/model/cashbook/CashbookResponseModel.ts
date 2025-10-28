export interface ICashBookResponse {
  id: number;
  note?: string;
  amount: number;
  employeeId: number;
  branchId: number;
  empName: string;
  transDate: string;
  categoryName: string;
  categoryId?: number;
  fmtTransDate?: string | null;
  type?: number;
  bill?: string;
  remaining?: number;
  invoiceId?: number;
  invoiceType?: string;
  projectId?: number;
  projectName?: string;
  contractId?: number;
  contractName?: string;
}
