import { ITreatmentRoomResponseModal } from "./TreatmentRoomResponseModal";

export interface ITreatmentRoomListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface IAddTreatmentRoomModalProps {
  onShow: boolean;
  data: ITreatmentRoomResponseModal;
  onHide: (reload: boolean) => void;
}
