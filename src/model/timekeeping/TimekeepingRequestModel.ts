export interface ITimekeepingRequest {
  fmtWorkDay: string;
  workTypeId: number;
  workHour: number;
  status: number;
}

export interface ITimekeepingFilterRequest {
  month?: number;
  year?: number;
  employeeId?: number;
}

export interface ITimekeepingUpdateCaringEmployeeRequest {
  id?: number;
  caringEmployeeId: number;
}
