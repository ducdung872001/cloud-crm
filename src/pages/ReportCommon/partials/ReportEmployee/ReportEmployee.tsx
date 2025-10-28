import React, { useEffect, useState } from "react";
import { IReportCommonProps } from "model/report/PropsModel";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import { IReportEmployeeResponse } from "model/report/ReportResponse";
import CustomChartBasic from "components/customChartBasic/customChartBasic";
import ReportService from "services/ReportService";
import { showToast } from "utils/common";
import "./ReportEmployee.scss";

export default function ReportEmployee(props: IReportCommonProps) {
  const { params } = props;

  const [lstEmployee, setLstEmployee] = useState<IReportEmployeeResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [maxTotalEmployee, setMaxTotalEmployee] = useState<number>(0);

  const getEmployee = async (paramsSearch: IReportCommonFilterRequest) => {
    setIsLoading(true);

    const response = await ReportService.employee(paramsSearch);

    if (response.code == 0) {
      const result = response.result;

      setLstEmployee(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (params.fromTime && params.toTime) {
      getEmployee(params);
    }
  }, [params]);

  useEffect(() => {
    let takeMaxTotalEmployee = 0;

    if (lstEmployee.length > 0) {
      lstEmployee.filter((item) => {
        if (takeMaxTotalEmployee < item.amount) {
          return (takeMaxTotalEmployee = item.amount);
        }
      });

      setMaxTotalEmployee(takeMaxTotalEmployee);
    }
  }, [lstEmployee]);

  return (
    <div className="page__report--employee">
      <CustomChartBasic isLoading={isLoading} lstData={lstEmployee} totalMax={maxTotalEmployee} nameNotification="nhân viên" />
    </div>
  );
}
