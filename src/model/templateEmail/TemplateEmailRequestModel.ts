export interface ITemplateEmailFilterRequest {
  name: string;
  type?: number;
  tcyId?: number;
  page?: number;
  limit?: number;
}

export interface ITemplateEmailRequestModel {
  title: string;
  content: string;
  initialContent?: string;
  contentDelta: string;
  type: string;
  tcyId: number;
  placeholder: string;
}
