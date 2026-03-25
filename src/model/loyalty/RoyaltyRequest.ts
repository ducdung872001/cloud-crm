export interface IRoyaltyFilterRequest {
  name?: string;
  limit?: number;
  page?: number;
}

export interface ILoyaltySegmentRequest {
  id?: number;
  point?: number;
  name?: string;
  /** Tỷ lệ tích điểm, vd: "1%", "3%" */
  rate?: string;
  /**
   * Quyền lợi – JSON array string
   * vd: '["Tích 1% điểm thưởng","Giảm 5% sinh nhật"]'
   */
  benefits?: string;
}

export interface ILoyaltyWalletRequest {
  id?: number;
  status?: number;
  customerId?: number;
  customerName?: string;
}

export interface ILoyaltyRewardRequest {
  id?: number;
  name?: string;
  description?: string;
  pointsRequired?: number;
  status?: number;
  rewardItems?: string;
}