import { IUnitResponse } from "./UnitResponseModel";

export interface AddUnitModalProps {
  onShow: boolean;
  data?: IUnitResponse;
  onHide: (reload: boolean) => void;
}

export interface IProductUnitListProps {
  onBackProps: (isBack: boolean) => void;
}
