export interface IContactResponse {
  id: number;
  name: string;
  phone: string;
  note: string;  
  avatar: string;
  employeeId: number | string;
  positionId: number | string;
  positionName: string;
  employeeName: string;
  customers: string;
  emails: string;
  bsnId: number;
  lstCustomer: Record<string, unknown>[],
  contactExtraInfos: Record<string, unknown>[];
  pipelineId: number | string,
  pipelineName: string,
  statusId:  number | string,
  statusName: string;
  cardvisitFront: string;
  cardvisitBack: string;
  department: string;
  coordinators: Record<string, unknown>[];
  primaryCustomerId: number | null;
}
