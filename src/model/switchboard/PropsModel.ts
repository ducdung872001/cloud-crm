import { ISwitchboardResponseModel } from "./SwitchboardResponseModel";

export interface IAddSwitchboardModelProps {
  onShow: boolean;
  data?: ISwitchboardResponseModel;
  onHide: (reload: boolean) => void;
}

export interface ISwitchboardListProps {
  onBackProps: (isBack: boolean) => void;
}
