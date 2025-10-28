import { ICrmCampaignResponse } from "./CrmCampaignResponseModel";

export interface AddCrmCampaignModalProps {
  onShow: boolean;
  data?: ICrmCampaignResponse;
  onHide: (reload: boolean) => void;
}
