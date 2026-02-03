// NOTE:
// File này dành cho "thẻ khách hàng / thẻ hạng thành viên" (boughtCustomerCard),
// tránh copy nhầm model từ boughtService.

export interface IBoughtCustomerCardResponse {
  id: number;
  action: number;
  customerId: number;
  invoiceId: number;
  invoiceCode?: string | number;

  // Card info
  cardId: number;
  cardCode?: string;
  cardName?: string;
  cardAvatar?: string;
  cardNumber?: string | number;

  // Pricing
  qty: number;
  price: number;
  priceDiscount: number;
  discount: number;
  discountUnit: number; // 0: none, 1: %, 2: cash (tùy backend)
  fee: number;

  // Meta
  receiptDate?: string | number;
  note: string;
  saleEmployeeId: number;
  saleId?: number; // Alias for saleEmployeeId
  updatedTime: string;
}

// Dùng cho màn danh sách "thẻ khách hàng theo khách hàng" nếu backend trả thêm info.
export interface IBoughtCustomerCardByCustomerResponse extends IBoughtCustomerCardResponse {
  customerName?: string;
  customerPhone?: string;
}
