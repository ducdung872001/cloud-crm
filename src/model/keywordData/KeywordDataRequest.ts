export interface IKeyWordDataFilterResquest {
  keyword: "";
  page?: number;
  limit?: number;
}

export interface IKeyWordDataResquest {
  id: number;
  name: string;
  language: string;
  nameSub: string;
  nameXor: string;
  type: string;
  industryId: number;
}
