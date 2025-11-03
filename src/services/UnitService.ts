import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IUnitFilterRequest, IUnitRequest } from "model/unit/UnitRequestModel";

export default {
  list: (params: IUnitFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.unit.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IUnitRequest) => {
    return fetch(urlsApi.unit.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.unit.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
