export interface IScheduleTreatmentResponseModalProps {
  onShow: boolean;
  startDate: Date | string;
  endDate: Date | string;
  onHide: (reload: boolean) => void;
  idData: number;
  idCustomer?: number;
}
