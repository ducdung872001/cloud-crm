import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IContractPipelineFilterRequest, IContractPipelineRequest } from "model/contractPipeline/ContractPipelineRequestModel";

export default {
  list: (params?: IContractPipelineFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractPipeline.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContractPipelineRequest) => {
    return fetch(urlsApi.contractPipeline.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractPipeline.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contractPipeline.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  
  contractSubPipelineUpdate: (body: any) => {
    return fetch(urlsApi.contractPipeline.contractSubPipelineUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

};
