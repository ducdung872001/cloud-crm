export interface ICardResponse {
  id: number;
  name: string;
  note: string;
  code: string;
  avatar: string;
  payoutMax: number | string;
  payoutMin: number | string;
  bsnId: number;
  type: number | string;
  price: number | string;
  ranking: number;
}
