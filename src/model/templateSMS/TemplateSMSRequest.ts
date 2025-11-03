export interface ITemplateSMSFilterRequest {
  name?: string;
  brandnameId?: number;
  tcyId?: number;
  page?: number;
  limit?: number;
}

export interface ITemplateSMSRequest {
  id?: number;
  title: string;
  content: string;
  initialContent: string;
  tcyId: number;
  brandnameId: number;
}
