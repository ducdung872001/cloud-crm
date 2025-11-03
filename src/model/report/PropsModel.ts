import { IReportCommonFilterRequest } from "./ReportRequest";

export interface IReportCommonProps {
  params: IReportCommonFilterRequest;
  callback?: (data) => void;
}
