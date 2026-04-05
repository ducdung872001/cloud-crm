export interface ICampaignResponseModel {
  id: number;
  code: string;
  name: string;
  type: string;
  cover: string;
  startDate: string;
  endDate: string;
  position?: number;
  employeeId: number;
  employeeName?: string;
  employeeAvatar?: string;
  divisionMethod: number;
  approach?: string;
  createdTime?: string;
  bsnId?: number;
  sales: string;
  lstOpportunityProcess?: Record<string, unknown>[],
  averageConvertRate?: number | string;
  totalRevenue?: number | string;
  totalCustomer?: number | string;
  branches0?: Record<string, unknown>[];
  branches1?: Record<string, unknown>[];
  branches2?: Record<string, unknown>[];
  branches3?: Record<string, unknown>[];
  branches4?: Record<string, unknown>[];
  lstDepartment?: Record<string, unknown>[];
  lstBranch?: Record<string, unknown>[];
  coordinators?: Record<string, unknown>[];
  lstCoordinator?: Record<string, unknown>[];
  status: string | number;
  saleDistributionType?: string;
}
