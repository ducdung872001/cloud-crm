export interface IAddConsultationScheduleModalProps {
  onShow: boolean;
  startDate: Date | string;
  endDate?: Date | string;
  onHide: (reload: boolean) => void;
  idData?: number;
  idCustomer?: number;
  dataOpp?: Record<string, unknown>;
}
