export interface ICampaignApproachResponseModel {
  id: number;
  name: string;
  step: number;
  campaignId: number;
  campaignName?: string;
  activities: string;
}
