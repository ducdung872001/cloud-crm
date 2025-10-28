export interface IPaymentHistoryRequest {
  id: number;
  amount: number;
  transDate: string;
  content?: string;
  bill?: string;
  recommenderPhone: string;
}

export interface IPaymentHistoryFilterRequest {
  recommenderPhone?: string;
  page?: number;
  limit?: number;
}
