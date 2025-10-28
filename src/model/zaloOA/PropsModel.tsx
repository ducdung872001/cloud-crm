import { IZaloOAResponse } from "./ZaloOAResponse";

export interface ITableZaloOAProps {
  listZaloOA: IZaloOAResponse[];
  isLoading: boolean;
  isPermissionsZalo: boolean;
  dataPagination: any;
  callback: any;
}

export interface LoginZaloModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  getListZaloOA: () => void;
}