export interface IDiarySurgeryFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IDiarySurgeryRequestModel {
  thyId: number;
  diaryDate: string;
  medias: string;
  note: string;
  customerId: number;
  serviceId: number;
  serviceNumber: string;
  cardNumber: string;
}
