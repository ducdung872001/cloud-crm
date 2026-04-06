import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.customer.area, params);
  },
};
