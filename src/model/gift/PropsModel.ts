import { IGiftRespone } from "./GiftResponseModel";

export interface AddGiftModalProps {
  onShow: boolean;
  data?: IGiftRespone;
  onHide: (reload: boolean) => void;
}

export interface AddGiftServiceModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
}

export interface AddGiftServiceEventModalProps {
  idGift: number;
  eventId: number;
  UpdateObjectId: (id: number, objectId: number) => void;
  onShow: boolean;
  onHide: (reload: boolean) => void;
}

export interface IAddSeoGiftModalProps {
  idGift: number;
  onShow: boolean;
  onHide: () => void;
}

export interface IGiftListProps {
  onBackProps: (isBack: boolean) => void;
}