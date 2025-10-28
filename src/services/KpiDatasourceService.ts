import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IKpiDatasourceFilterRequest, IKpiDatasourceRequest } from "model/kpiDatasource/KpiDatasourceRequestModel";

export default {
  list: (params: IKpiDatasourceFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpiDatasource.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IKpiDatasourceRequest) => {
    return fetch(urlsApi.kpiDatasource.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.kpiDatasource.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },  
};
