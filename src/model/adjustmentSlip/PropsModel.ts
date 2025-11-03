export interface IAddAdjustmentSlipProps {
  onShow: boolean;
  id: number;
  onHide: (reload: boolean) => void;
}

export interface IChooseProductModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  satId?: number;
  inventory: any;
  lstBatchNoProduct: string[];
}
