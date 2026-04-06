import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IVideoSupportFilterRequest } from "model/videoSupport/VideoSupportRequestModel";

export default {
  list: (params?: IVideoSupportFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.videoSupport.list, params, signal);
  },
};
