import { apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


/**
 * Gọi về core để xử lý dưới core
 */
export default {
  post: (body) => {
    return apiPost(urlsApi.rest.callApi, body);
  },
};
