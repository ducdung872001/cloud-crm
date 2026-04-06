import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IContractPipelineFilterRequest, IContractPipelineRequest } from "model/contractPipeline/ContractPipelineRequestModel";

export default {
  list: (params?: IContractPipelineFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractPipeline.list, params, signal);
  },
  update: (body: IContractPipelineRequest) => {
    return apiPost(urlsApi.contractPipeline.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractPipeline.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contractPipeline.delete}?id=${id}`);
  },
  
  contractSubPipelineUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractPipeline.contractSubPipelineUpdate, body);
  },

};
