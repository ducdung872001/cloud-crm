export interface IEmployeeResponse {
  id: number;
  name: string;
  phone: string;
  address?: string;
  jteId: number;
  status: number | string;
  viewMode: number | string;
  viewCustomerMode: number | string;
  viewContractMode?: number | string;
  viewBusinessPartnerMode?: number | string;
  viewProjectMode?: number | string;
  viewWorkMode?: number | string;
  viewFsMode?: number | string;
  viewQuoteMode?: number | string;
  viewOpportunityMode?: number | string;
  position: number;
  userId: number;
  bsnId: number;
  serviceCount?: number;
  title?: string;
  isOwner: number;
  branchId: number;
  branchName: string;
  departmentId: number;
  departmentName: string;
  avatar: string;
  lstEmployeeId: number[];
  managerId: number;
  managerName: string;
  email: string;
  sip?: string;
  roles?: string;
  code?: string;
}
//   {label: "Quyền xem công việc",
//   name: "viewWorkMode"},
//   {label: "Quyền xem FS",
//   name: "viewFsMode"},
//   {label: "Quyền xem báo giá",
//   name: "viewQuoteMode"},
