export interface ISurveyFormFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface ISurveyFormRequestModel {
  name: string;
  startTime: string;
  endTime: string;
  link: string;
  shortLink: string;
  params: string;
  form: string;
  range: string;
}
