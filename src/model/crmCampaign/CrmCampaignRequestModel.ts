export interface ICrmCampaignFilterRequest {
  page?: number;
  limit?: number;
}

export interface ICrmCampaignRequest {
  id: number;
  name: string;
  bsnId: number;
  position: number | string;
}
