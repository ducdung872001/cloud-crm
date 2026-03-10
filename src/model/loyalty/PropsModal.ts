import { ILoyaltyPointLedgerResposne, IProgramRoyaltyResposne, ILoyaltyRewardResposne, ILoyaltySegmentResposne, ILoyaltyWalletResponse } from "./RoyaltyResposne";

export interface AddProgramRoyaltyModalProps {
  onShow: boolean;
  data?: IProgramRoyaltyResposne;
  onHide: (reload: boolean) => void;
}

export interface AddLoyaltyPointLedgerModalProps {
  onShow: boolean;
  data?: ILoyaltyPointLedgerResposne;
  onHide: (reload: boolean) => void;
}
export interface AddLoyaltyRewardProps {
  onShow: boolean;
  data?: ILoyaltyRewardResposne;
  onHide: (reload: boolean) => void;
}

export interface AddLoyaltySegmentProps {
  onShow: boolean;
  data?: ILoyaltySegmentResposne;
  onHide: (reload: boolean) => void;
}

export interface AddLoyaltyWalletProps {
  onShow: boolean;
  data?: ILoyaltyWalletResponse;
  onHide: (reload: boolean) => void;
}

export interface ICustomerRoyaltyListProps {
  onBackProps: (isBack: boolean) => void;
}
