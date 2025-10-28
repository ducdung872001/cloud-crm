import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IVideoSupportFilterRequest } from "model/videoSupport/VideoSupportRequestModel";

export default {
  list: (params?: IVideoSupportFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.videoSupport.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
