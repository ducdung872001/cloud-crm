import { IEmployeeResponse } from "./EmployeeResponseModel";
import { IUserRequest } from "model/user/UserRequestModel";

export interface AddEmployeeModalProps {
  onShow: boolean;
  data?: IEmployeeResponse;
  onHide: (reload: boolean) => void;
}

export interface IEmployeeListProps {
  onBackProps: (isBack: boolean) => void;
}

export interface ICreateAccountEmployeeProps {
  onShow: boolean;
  data?: IEmployeeResponse;
  onHide: (reload: boolean) => void;
}

export interface IViewNewPasswordProps {
  onShow: boolean;
  password: string;
  data?: any;
  onHide: (reload?: boolean) => void;
}
