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
  lstCustomer: any,
  contactExtraInfos: any;
  pipelineId: number | string,
  pipelineName: string,
  statusId:  number | string,
  statusName: string;
  cardvisitFront: string;
  cardvisitBack: string;
  department: string;
  coordinators: any;
  primaryCustomerId: any;
}
