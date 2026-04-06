import { apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { IEstimateRequestModel } from "model/estimate/EstimateRequestModel";

export default {
  takeEstimate: (body: IEstimateRequestModel) => {
    return apiPost(urlsApi.estimate.takeEstimate, body);
  },
};
