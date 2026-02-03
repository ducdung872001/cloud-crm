export interface IBoughtCustomerCardRequest {
  cardId: number;
  cardNumber: string;
  status: number;
  saleId: number;
  customerId: number;
  invoiceId: number;
  fee: number;
  id?: number;
}
