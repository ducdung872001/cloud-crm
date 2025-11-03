export interface ICardFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface ICardRequest {
  id: number;
  name: string;
  note: string;
  code: string;
  avatar: string;
  payoutMax: number | string;
  payoutMin: number | string;
  bsnId: number;
}
