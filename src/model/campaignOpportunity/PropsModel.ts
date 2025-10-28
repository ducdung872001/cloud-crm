export interface IAddCampaignOpportunityModel {
  onShow: boolean;
  idData?: number;
  conditionCampain?: any;
  idCustomer?: number;
  isBatch?: boolean;
  listId?: number[]; //Trường hợp muốn thêm cả lô khách hàng vào trong chiến dịch bán hàng
  onHide: (reload: boolean) => void;
  dataCustomerProps?: any;
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
  dataWork: any;
}

export interface IDetailManagementOpportunityProps {
  idData: number;
  idCampaign: number;
  onShow: boolean;
  onHide: (reload: boolean) => void;
}
