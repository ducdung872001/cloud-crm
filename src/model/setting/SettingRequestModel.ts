export interface ISettingFilterRequest {
  page?: number;
  limit?: number;
}

export interface ISettingRequest {
  id?: number;
  name: string;
  type?: string;
  value: string;
  code?: string;
  fmtStartDate?: string | null;
  fmtEndDate?: string | null;
  endDate?: string | null;
  startDate?: string | null;
}
