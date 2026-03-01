export interface IStoreFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IStoreRequest {
  id: number;
  parentId: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  contact: string;
  description: string;
  alias: string;
  avatar: string;
  headquarter: number;
  foundingDay: string | number;
  foundingMonth: string | number;
  foundingYear: string | number;
  website: string;
  code: string;
  doctorNum: string | number;
  goodAt: string;
}
