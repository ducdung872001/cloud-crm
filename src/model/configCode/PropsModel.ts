import { IConfigCodeResponseModel } from "./ConfigCodeResponse";

export interface AddConfigCodeModalProps {
  onShow: boolean;
  data: IConfigCodeResponseModel;
  onHide: (reload: boolean) => void;
}

export interface IConfigEmailListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface IAddConfigEmailModalProps {
  onShow: boolean;
  data: IConfigCodeResponseModel;
  onHide: (reload: boolean) => void;
}

export interface IConfigSMSListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface IConfigCallListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface IAddConfigSMSModalProps {
  onShow: boolean;
  data: IConfigCodeResponseModel;
  onHide: (reload: boolean) => void;
}

export interface IAddConfigCallModalProps {
  onShow: boolean;
  data: IConfigCodeResponseModel;
  onHide: (reload: boolean) => void;
}