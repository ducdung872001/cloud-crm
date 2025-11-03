export interface IContractFilterRequest {
  name?: string;
  pipelineId?: number;
  approachId?: number;
  customerId?: number;
  page?: number;
  limit?: number;
  type?: number;
  fmtStartEndDate?: any;
  fmtEndEndDate?: any;
}

export interface IContractFieldFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IContractRequest {
  id: number;
  customerId: number;
  businessPartnerId: number;
  businessPartnerName: string;
  name: string;
  taxCode: string;
  contractNo: string;
  signDate: Date | string;
  affectedDate: Date | string;
  endDate: Date | string;
  adjustDate: Date | string;
  dealValue: number | string;
  employeeId: number | string; //Người phụ trách
  employeeName?: string;
  categoryId: number | string; //Loại hợp đồng
  categoryName: string;
  pipelineId: number | string; //Loại hợp đồng
  pipelineName: string;
  stageId: number;
  stageName: string;
  branchId: number;
  bsnId?: number;
  contractExtraInfos?: any; //Thuộc tính thêm
  timestamp?: any;
  peopleInvolved?: any;
  custType?: number;

  projectId?: number;
  projectName?: string;
  fsId?: number;
  fsName?: string;
  floorId?: number;
  floorName?: string;
  unitId?: number;
  unitName?: string;

  blankArea?: number | string;
  fillArea?: number | string;
  nfaArea?: number | string;
  actualArea?: number | string;
  lobbyArea?: number | string;
  totalArea?: number | string;
  rentalTypes?: any;
  rteId?: number;
  rentalTypeName?: string;

  rentalMonth?: number | string;
  deliveryDate?: Date | string;
  billStartDate?: Date | string;
  unitPrice?: number | string;
  lobbyUnitPrice?: number | string;
  serviceUnitPrice?: number | string;
  lobbyServiceUnitPrice?: number | string;
  contractExchangeRate?: number | string;
  deposit?: number | string;
  template?: string;
  requestId?: number;
  requestCode?: string;
  products?: any;
  opportunityId?: number;
}

export interface IContractAlertRequest {
  id: number;
  endDate: any;
  alertConfig: any;
}

export interface IUpdateStageRequest {
  id: number;
  stageId: number;
  name?: string;
  pipelineId?: number;
  signDate?: any;
  taxCode?: string;
  affectedDate?: any;
  branchId?: number;
  contractExtraInfos?: any;
  contractNo?: string;
  customerId?: number;
  dealValue: number | string;
  employeeId?: number;
  endDate?: any;
}
