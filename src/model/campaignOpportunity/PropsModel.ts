export interface IAddCampaignOpportunityModel {
  onShow: boolean;
  idData?: number;
  conditionCampain?: Record<string, unknown>;
  idCustomer?: number;
  isBatch?: boolean;
  listId?: number[]; //Trường hợp muốn thêm cả lô khách hàng vào trong chiến dịch bán hàng
  onHide: (reload: boolean) => void;
  dataCustomerProps?: Record<string, unknown>;
}

export interface IAddChangeProbabilityModelProps {
  onShow: boolean;
  idCampaign: number;
  idData: number;
  idApproach: number;
  status: number;
  qualityColum: number;
  percentProp: number;
  onHide: (reload: boolean) => void;
  // updateApproach: any;
  dataWork: Record<string, unknown>;
}

export interface IDetailManagementOpportunityProps {
  idData: number;
  idCampaign: number;
  onShow: boolean;
  onHide: (reload: boolean) => void;
}
