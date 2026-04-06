import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IRelationShipFilterRequest, IRelationShipRequest } from "model/relationShip/RelationShipRequest";

export default {
  list: (params?: IRelationShipFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.relationShip.list, params, signal);
  },
  update: (body: IRelationShipRequest) => {
    return apiPost(urlsApi.relationShip.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.relationShip.delete}?id=${id}`);
  },
};
