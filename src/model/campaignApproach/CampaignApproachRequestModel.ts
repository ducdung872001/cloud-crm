export interface ICampaignApproachFilterRequest {
  name?: string;
  campaignId?: number;
}

export interface ICampaignApproachRequestModel {
  id?: number;
  name?: string;
  step?: number;
  activities?: string;
  campaignId?: number;
}
