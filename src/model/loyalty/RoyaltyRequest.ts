export interface IRoyaltyFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IProgramRoyaltyRequest {
  id?: number;
  name?: string;
  processCode?: string;
  employeeId?: number;
  employeeName?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  priorityLevel?: number;
  active?: boolean;
  branchIds?: number[] | string; // [1,2,3,4]
  processId?: number;
  processName?: string;
  startNodeId?: string;
  createdAt?: string;
}

export interface ILoyaltyPointLedgerRequest {
  id?: number;
  name?: string;
  walletId?: number;
  customerId?: number;
  customerName?: string;
  point?: number;
  description?: string;
  createdTime?: string;
  employeeId?: number;
  employeeName?: string;
  loyaltyProgramId?: number;
  loyaltyProgramName?: string;
  loyaltyRewardId?: number;
  loyaltyRewardName?: string;
}

export interface ILoyaltyRewardRequest {
  id?: number;
  name?: string;
  description?: string;
  pointsRequired?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  rewardItems?: string;
}

export interface ILoyaltySegmentRequest {
  id?: number;
  point?: number;
  name?: string;
}

export interface ILoyaltyWalletRequest {
  id?: number;
  status?: number;
  customerId?: number;
  customerName?: string;
  totalEarn?: number;
  currentBalance?: number;
  segmentId?: number;
  segmentName?: string;
  createdTime?: string;
  page?: number;
  limit?: number;
}
