import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IPositionFilterRequest, IPositionRequest } from "model/position/PositionRequestModel";

/**
 * Chức vụ của người liên hệ
 */
export default {
  list: (params: IPositionFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.position.list, params, signal);
  },
  update: (body: IPositionRequest) => {
    return apiPost(urlsApi.position.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.position.delete}?id=${id}`);
  },
};
