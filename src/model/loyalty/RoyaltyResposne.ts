export interface IProgramRoyaltyResposne {
  processCode?: string;
  id?: number;
  name?: string;
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

export interface ILoyaltyPointLedgerResposne {
  id?: number;
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

export interface ILoyaltyRewardResposne {
  id?: number;
  name?: string;
  description?: string;
  pointsRequired?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  rewardItems?: string;
}

export interface ILoyaltySegmentResposne {
  id?: number;
  point?: number;
  name?: string;
}

export interface ILoyaltyWalletResponse {
  id?: number;
  status?: number;
  customerId?: number;
  customerName?: string;
  totalEarn?: number;
  currentBalance?: number;
  segmentId?: number;
  segmentName?: string;
  createdTime?: string;
}

