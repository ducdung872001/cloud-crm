import React, { useEffect, useState } from "react";
import { IReportCommonProps } from "model/report/PropsModel";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import { IReportServiceResponse } from "model/report/ReportResponse";
import CustomChartBasic from "components/customChartBasic/customChartBasic";
import ReportServices from "services/ReportService";
import { showToast } from "utils/common";
import "./ReportService.scss";

export default function ReportService(props: IReportCommonProps) {
  const { params } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listService, setListService] = useState<IReportServiceResponse[]>([]);
  const [maxTotalService, setMaxTotalService] = useState<number>(0);

  const getService = async (paramsSearch: IReportCommonFilterRequest) => {
    setIsLoading(true);

    const response = await ReportServices.service(paramsSearch);

    if (response.code == 0) {
      const result = response.result;

      setListService(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (params.fromTime && params.toTime) {
      getService(params);
    }
  }, [params]);

  useEffect(() => {
    let takeMaxTotalService = 0;

    if (listService.length > 0) {
      listService.filter((item) => {
        if (takeMaxTotalService < item.amount) {
          return (takeMaxTotalService = item.amount);
        }
      });

      setMaxTotalService(takeMaxTotalService);
    }
  }, [listService]);

  return (
    <div className="page__report--service">
      <CustomChartBasic isLoading={isLoading} lstData={listService} totalMax={maxTotalService} nameNotification="dịch vụ" />
    </div>
  );
}
