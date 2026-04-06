import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IGiftFilterRequest, IGiftRequest, IUpdateObjectIdRequest } from "model/gift/GiftRequestModel";

export default {
  list: (params: IGiftFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.gift.list, params, signal);
  },
  update: (body: IGiftRequest) => {
    return apiPost(urlsApi.gift.update, body);
  },
  updateObjectId: (body: IUpdateObjectIdRequest) => {
    return apiPost(urlsApi.gift.updateObjectId, body);
  },
  delete: (id: number, objectType: number, objectId: number) => {
    return apiDelete(`${urlsApi.gift.delete}?id=${id}&objectType=${objectType}&objectId=${objectId}`);
  },
};
