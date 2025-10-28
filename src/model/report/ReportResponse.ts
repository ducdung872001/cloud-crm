export interface IReportRevenueResponse {
  date: string;
  debt: number;
  expense: number;
  income: number;
  revenue: number;
  time: number;
}

export interface IReportProductResponse {
  id: number;
  name: string;
  amount: number;
}

export interface IReportServiceResponse {
  id: number;
  name: string;
  amount: number;
}

export interface IReportEmployeeResponse {
  id: number;
  name: string;
  amount: number;
}

export interface IReportCityResponse {
  id: number;
  name: string;
  amount: number;
}

export interface IReportCardServiceResponse {
  id: number;
  name: string;
  amount: number;
}
