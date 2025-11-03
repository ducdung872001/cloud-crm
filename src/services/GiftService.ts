import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IGiftFilterRequest, IGiftRequest, IUpdateObjectIdRequest } from "model/gift/GiftRequestModel";

export default {
  list: (params: IGiftFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.gift.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IGiftRequest) => {
    return fetch(urlsApi.gift.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateObjectId: (body: IUpdateObjectIdRequest) => {
    return fetch(urlsApi.gift.updateObjectId, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number, objectType: number, objectId: number) => {
    return fetch(`${urlsApi.gift.delete}?id=${id}&objectType=${objectType}&objectId=${objectId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
