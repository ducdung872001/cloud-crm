export interface IRoyaltyPointFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IRoyaltyPointRequest {
  id: number;
  cardId?: string;
  cardNumber?: string;
  customerId?: number;
  createdTime?: string;
  customerName?: string;
  point?: number;
  note?: string;
}
