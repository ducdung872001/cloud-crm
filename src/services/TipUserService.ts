import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import {
  ITipUserFilterRequest,
  ITipUserRequest,  
} from "model/tipUser/TipUserRequestModel";

export default {
  list: (params: ITipUserFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.tipUser.list, params, signal);
  },
  update: (body: ITipUserRequest) => {
    return apiPost(urlsApi.tipUser.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.tipUser.delete}?id=${id}`);
  },  
};
