import { IZaloOAResponse } from "./ZaloOAResponse";

export interface ITableZaloOAProps {
  listZaloOA: IZaloOAResponse[];
  isLoading: boolean;
  isPermissionsZalo: boolean;
  dataPagination: Record<string, unknown>;
  callback: () => void;
}

export interface LoginZaloModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  getListZaloOA: () => void;
}