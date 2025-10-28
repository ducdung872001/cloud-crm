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
  lstOpportunityProcess?: any,
  averageConvertRate?: number | string;
  totalRevenue?: number | string;
  totalCustomer?: number | string;
  branches0?: any;
  branches1?: any;
  branches2?: any;
  branches3?: any;
  branches4?: any;
  lstDepartment?: any;
  lstBranch?: any;
  coordinators?: any;
  lstCoordinator?: any;
  status: string | number;
  saleDistributionType?: string;
}
