export interface ICampaignOpportunityResponseModel {
  id: number;
  campaignId: number;
  type: string;
  campaignName?: string;
  createdTime?: string;
  creatorId?: number;
  customerAddress?: string;
  customerAvatar?: string;
  customerEmail?: string;
  customerId: number;
  customerName?: string;
  customerPhone?: string;
  employeeId: number;
  employeeName?: string;
  employeeAvatar?: string;
  employeePhone?: string;
  endDate: string;
  expectedRevenue: number;
  lstOpportunityProcess?: Record<string, unknown>[];
  refId: number;
  startDate?: string;
  saleId?: number;
  opportunity?: Record<string, unknown>;
  opportunityId?: number;
  saleName?: string;
  saleAvatar?: string;
  sourceId: number;
  sourceName?: string;
  status?: number | string;
  approachId: number;
  updatedTime?: string;
  percent?: number;
  approachName?: string;
  activities?: Record<string, unknown>[],
  note?: string;
  pipelineId?: number;
  pipelineName?: string;
}

export interface IOpportunityExchangeResponseModal {
  id: number;
  content: string;
  contentDelta: string;
  createdTime: string;
  employeeAvatar: string;
  employeeId: number;
  employeeName: string;
  loginEmployeeId: number;
  viewers: Record<string, unknown>[];
  coyId: number;
}

