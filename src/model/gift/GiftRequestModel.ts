export interface IGiftFilterRequest {
  page?: number;
  limit?: number;
}

export interface IGiftRequest {
  id: number;
  name: string;
  objectId: number;
  objectType: string;
  startDate: string;
  endDate: string;
  cover: string;
  content: string;
}

export interface IUpdateObjectIdRequest {
  id: number;
  objectId: number;
}

export interface IGiftServiceEventRequest {
  id: number;
  address: string;
  prerequisite: string;
  prerequisiteDelta: string;
  serviceDiscount: string;
}

export interface IGiftSeoRequest {
  id: number;
  pageTitle: string;
  pageLink: string;
  pageDescription: string;
  pageKeyword: string;
}

export interface IGiftCheckLinkRequest {
  link?: string;
  id?: number;
}
