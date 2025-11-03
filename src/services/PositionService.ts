import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IPositionFilterRequest, IPositionRequest } from "model/position/PositionRequestModel";

/**
 * Chức vụ của người liên hệ
 */
export default {
  list: (params: IPositionFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.position.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IPositionRequest) => {
    return fetch(urlsApi.position.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.position.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
