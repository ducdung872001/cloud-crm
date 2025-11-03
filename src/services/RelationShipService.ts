import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IRelationShipFilterRequest, IRelationShipRequest } from "model/relationShip/RelationShipRequest";

export default {
  list: (params?: IRelationShipFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.relationShip.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IRelationShipRequest) => {
    return fetch(urlsApi.relationShip.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.relationShip.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
