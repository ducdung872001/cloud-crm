interface IOpportunity {
  id: number;
  bsnId: number;
  contactId: number;
  contactName: string;
  coordinators: string;
  createdTime: string;
  customerId: number;
  customerName: string;
  lstCoordinator: string;
  lstCoordinatorId: number;
  productId: number;
  productName: string;
  serviceAvatar: string;
  serviceId: number;
  serviceName: string;
}

export interface IWorkOptResponseModel {
  id: number;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  description: string;
  customerName: string;
  employeeId: number;
  departmentId: number;
  docLink: string;
  parentId: number;
  bsnId?: number;
  type: string;
  opportunity?: IOpportunity;
}
