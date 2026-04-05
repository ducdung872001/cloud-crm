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
  setDataTipUser: (data: ITipUserResponse) => void;
  showModalAdd: boolean;
  setShowModalAdd: (show: boolean) => void;
  setIsDetailUser: (isDetail: boolean) => void;
}

export interface ITipUserDetail {
  showModalCommissionRate: boolean;
  setShowModalCommissionRate: (show: boolean) => void;
  dataTipUser: ITipUserResponse;
  dataDetailTip: Record<string, unknown>; // bao giờ api thì định nghĩa kiểu dữ liệu cho nó
  setDataDetailTip: (data: Record<string, unknown>) => void;
}

export interface IAddTipRoseProps {
  onShow: boolean;
  data?: Record<string, unknown>;
  dataEmployee?: ITipUserResponse;
  onHide: (reload: boolean) => void;
}
