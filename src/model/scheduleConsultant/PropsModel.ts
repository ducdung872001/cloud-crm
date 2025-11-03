export interface IAddConsultationScheduleModalProps {
  onShow: boolean;
  startDate: any;
  endDate?: any;
  onHide: (reload: boolean) => void;
  idData?: number;
  idCustomer?: number;
  dataOpp?: any;
}
