export interface ICardServiceFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface ICardServiceRequest {
  id: number;
  name: string;
  code: string;
  avatar: string;
  cash: number | string;
  account: number | string;
  note: string;
  bsnId: number;
  multiPurpose: number | string;
  serviceId: number;
  serviceCombo: string;
  // thêm trường này vào hiển thị lên form
  treatmentNum: number;
}
