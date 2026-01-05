import { IOpportunityExchangeResponseModal } from "./CampaignOpportunityResponseModel";

export interface ICampaignOpportunityFilterRequest {
  name?: string;
  campaignId?: number;
  customerId?: number;
  approachId?: number;
  saleId?: number;
  pipelineId?: number;
  page?: number;
  limit?: number;
}

export interface ICampaignOpportunityRequestModel {
  id?: number;
  employeeId?: number;
  expectedRevenue?: number;
  endDate?: string;
  sourceId?: number;
  refId?: number;
  customerId?: number;
  campaignId?: number;
  approachId?: number;
  lstCustomerId?: number[];
  type?: string;
  saleId?: number;
  opportunityId?: number;
}

export interface IOpportunityProcessUpdateRequestModel {
  approachId: number;
  note: string;
  percent: number | string;
  status: number | string;
  coyId?: number;
}

export interface IChangeEmployeeRequestModel {
  employeeId: number;
  refId: number;
}

export interface IChangeSaleRequestModel {
  saleId: number;
  refId: number;
}

// trao đổi công việc
export interface IOpportunityExchangeFilterRequest {
  coyId?: number;
  page?: number;
  limit?: number;
}

export interface IMessageChatOpportunityProps {
  dataMessage: IOpportunityExchangeResponseModal;
  coyId: number;
  employeeId: number;
  takeHeightTextarea: (height: number) => void;
  onHide: (reload: boolean) => void;
}

export interface IMessageChatOpportunityRequestModal {
  content: string;
  coyId: number;
  employeeId?: number;
  id?: number;
  media?: any;
}

export interface IAddCoyViewerRequestModel {
  id: number;
  campaignOpportunityId: number;
  employeeId: number;
}
