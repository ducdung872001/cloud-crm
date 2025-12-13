export interface IScheduleCommonFilterRequest {
  lstId?: string;
  lstCustomerId?: string;
  branchId?:number | string ;
  startTime?: string;
  endTime?: string;
  types?: string;
  sources?: string;
  page: number;
}

export interface IListRelatedToCustomerCommonFilterRequest {
  customerId: number;
}
