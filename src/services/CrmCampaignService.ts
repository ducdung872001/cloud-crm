import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICrmCampaignFilterRequest, ICrmCampaignRequest } from "model/crmCampaign/CrmCampaignRequestModel";

export default {
  getList: (params?: ICrmCampaignFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.crmCampaign.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICrmCampaignRequest) => {
    return fetch(urlsApi.crmCampaign.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.crmCampaign.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
