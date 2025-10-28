import { urlsApi } from "configs/urls";
import { IEstimateRequestModel } from "model/estimate/EstimateRequestModel";

export default {
  takeEstimate: (body: IEstimateRequestModel) => {
    return fetch(urlsApi.estimate.takeEstimate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
