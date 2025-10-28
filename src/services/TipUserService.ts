import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  ITipUserFilterRequest,
  ITipUserRequest,  
} from "model/tipUser/TipUserRequestModel";

export default {
  list: (params: ITipUserFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tipUser.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITipUserRequest) => {
    return fetch(urlsApi.tipUser.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.tipUser.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },  
};
