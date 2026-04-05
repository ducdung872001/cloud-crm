export interface IContractFilterRequest {
  name?: string;
  pipelineId?: number;
  approachId?: number;
  customerId?: number;
  page?: number;
  limit?: number;
  type?: number;
  fmtStartEndDate?: string;
  fmtEndEndDate?: string;
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
  employeeId: number | string;
  employeeName?: string;
  categoryId: number | string;
  categoryName: string;
  pipelineId: number | string;
  pipelineName: string;
  stageId: number;
  stageName: string;
  branchId: number;
  bsnId?: number;
  contractExtraInfos?: Record<string, unknown>[];
  timestamp?: number;
  peopleInvolved?: Record<string, unknown>[];
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
  rentalTypes?: Record<string, unknown>[];
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
  products?: Record<string, unknown>[];
  opportunityId?: number;
}

export interface IContractAlertRequest {
  id: number;
  endDate: string;
  alertConfig: Record<string, unknown>;
}

export interface IUpdateStageRequest {
  id: number;
  stageId: number;
  name?: string;
  pipelineId?: number;
  signDate?: string;
  taxCode?: string;
  affectedDate?: string;
  branchId?: number;
  contractExtraInfos?: Record<string, unknown>[];
  contractNo?: string;
  customerId?: number;
  dealValue: number | string;
  employeeId?: number;
  endDate?: string;
}
