import { ISubsystemAdministrationResponse } from "./SubsystemAdministrationResponse";

export interface ISubsystemAdministrationListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface IAddSubsystemAdministrationModalProps {
  onShow: boolean;
  data?: ISubsystemAdministrationResponse;
  onHide: (reload: boolean) => void;
}

export interface IShowModalSubsystemProps {
  onShow: boolean;
  data: ISubsystemAdministrationResponse;
  currentPosition: number;
  takePosition: number;
  setTakePosition: (position: number) => void;
  onHide: (reload: boolean) => void;
}
