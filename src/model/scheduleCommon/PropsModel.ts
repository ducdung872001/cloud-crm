interface IFilterCalendar {
  chooseTypeCalendar: number[];
  sourcesCalendar: number[];
  lstEmployeeId: number[];
  lstCustomerId: number[];
  branchId: number | string,
  startTime: string;
  endTime: string;
}

export interface IFilterCalendarModalProps {
  onShow: boolean;
  onHide: () => void;
  idEmployee: number;
  filterCalendar: IFilterCalendar;
  setFilterCalendar: any;
}
