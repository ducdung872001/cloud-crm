import { ITipUserResponse } from "./TipUserResponseModel";

export interface IAddTipUserModalProps {
  onShow: boolean;
  data?: ITipUserResponse;
  tipType?: number;
  onHide: (reload: boolean) => void;
}

export interface AddTipUserToTipUserEmployeeModalProps {
  onShow: boolean;
  groupId: number;
  onHide: (reload: boolean) => void;
}

export interface ShowTipUserToTipUserEmployeeModalProps {
  onShow: boolean;
  showGroupId: number;
  onHide: (reload: boolean) => void;
}

export interface ITipUserProps {
  onBackProps: (isBack: boolean) => void;
}

export interface ITipListUserProps {
  dataTipUser: ITipUserResponse;
  setDataTipUser: any;
  showModalAdd: boolean;
  setShowModalAdd: any;
  setIsDetailUser: any;
}

export interface ITipUserDetail {
  showModalCommissionRate: boolean;
  setShowModalCommissionRate: any;
  dataTipUser: ITipUserResponse;
  dataDetailTip: any; // bao giờ api thì định nghĩa kiểu dữ liệu cho nó
  setDataDetailTip: any;
}

export interface IAddTipRoseProps {
  onShow: boolean;
  data?: any;
  dataEmployee?: ITipUserResponse;
  onHide: (reload: boolean) => void;
}
