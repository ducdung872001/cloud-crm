export interface IGiftRespone {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  cover: string;
  objectId: number;
  objectType: number;
  content: string;
  contentDelta: string;
}

export interface IGiftServiceEventResponse {
  id: number;
  address: string;
  prerequisite: string;
  prerequisiteDelta: string;
  serviceDiscount: string;
}
