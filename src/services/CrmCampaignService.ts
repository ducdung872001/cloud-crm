import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICrmCampaignFilterRequest, ICrmCampaignRequest } from "model/crmCampaign/CrmCampaignRequestModel";

export default {
  getList: (params?: ICrmCampaignFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.crmCampaign.list, params, signal);
  },
  update: (body: ICrmCampaignRequest) => {
    return apiPost(urlsApi.crmCampaign.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.crmCampaign.delete}?id=${id}`);
  },
};
