import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IObjectSourceFilterRequestModel } from "model/objectSource/ObjectSourceRequestModel";

export default {
  list: (params: IObjectSourceFilterRequestModel, signal?: AbortSignal) => {
    return fetch(`${urlsApi.objectSource.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
