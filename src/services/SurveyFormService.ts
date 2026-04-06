import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ISurveyFormFilterRequest, ISurveyFormRequestModel } from "model/surveyForm/SurveyFormRequestModel";

export default {
  lst: (params?: ISurveyFormFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.surveyForm.lst, params, signal);
  },
  update: (body: ISurveyFormRequestModel) => {
    return apiPost(urlsApi.surveyForm.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.surveyForm.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.surveyForm.delete}?id=${id}`);
  },
  submitVoc: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.surveyForm.submitVoc, body);
  },
  statistic: (id: number, params?: Record<string, unknown>) => {
    return fetch(`${urlsApi.surveyForm.statistic}/${id}/statistic${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
