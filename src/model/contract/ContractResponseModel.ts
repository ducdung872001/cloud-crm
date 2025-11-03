export interface IContractResponse {
  stageName: any;
  id: number;
  name: string;
  taxCode: string;
  contractNo: string;
  signDate: string;
  affectedDate: string;
  endDate: string;
  createdAt: string;
  dealValue: number | string;
  bsnId: number;
  stage: string;

  //Thông tin bổ sung
  pipelineName: string;
  pipelineId: number;
  approachId: number;
  approachName: string;
  customerId: number;
  customerName: string;
  businessPartnerName: string;
  employeeId: number;
  employeeName: string;
  branchId: number;
  contractExtraInfos: any;
  status: any;
  categoryName: AnalyserOptions;
}

export interface IExpireTimeRequestModel {
  id?: number;
  endDate?: any;
  expireTimeWarning?: number;
  expireTimeWarningUnit?: string;
  templateEmailId?: number | string;
  templateSmsId?: number | string;
  emails?: any;
  phoneNumbers?: any;
}
