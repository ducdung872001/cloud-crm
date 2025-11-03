import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ISurveyFormFilterRequest, ISurveyFormRequestModel } from "model/surveyForm/SurveyFormRequestModel";

export default {
  lst: (params?: ISurveyFormFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.surveyForm.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ISurveyFormRequestModel) => {
    return fetch(urlsApi.surveyForm.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.surveyForm.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.surveyForm.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  submitVoc: (body: any) => {
    return fetch(urlsApi.surveyForm.submitVoc, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  statistic: (id: number, params?: any) => {
    return fetch(`${urlsApi.surveyForm.statistic}/${id}/statistic${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
