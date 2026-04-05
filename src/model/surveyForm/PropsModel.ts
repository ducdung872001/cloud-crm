export interface IAddCustomerSurveyProps {
  onShow: boolean;
  onHide: (reload) => void;
  dataProps: Record<string, unknown>;
}
