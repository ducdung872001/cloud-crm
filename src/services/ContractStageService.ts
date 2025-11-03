import { urlsApi } from "configs/urls";
import { IContractStageRequest } from "model/contractApproach/ContractStageRequestModel";

export default {
  list: (pipelineId: number) => {
    return fetch(`${urlsApi.contractStage.list}?pipelineId=${pipelineId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContractStageRequest) => {
    return fetch(urlsApi.contractStage.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractStage.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contractStage.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
