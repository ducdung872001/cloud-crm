import React, { useEffect, useState } from "react";
import { IReportCommonProps } from "model/report/PropsModel";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import { IReportCardServiceResponse } from "model/report/ReportResponse";
import CustomChartBasic from "components/customChartBasic/customChartBasic";
import ReportService from "services/ReportService";
import { showToast } from "utils/common";
import "./ReportCardService.scss";

export default function ReportCardService(props: IReportCommonProps) {
  const { params } = props;

  const [lstCardService, setLstCardService] = useState<IReportCardServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [maxTotalCardService, setMaxTotalCardService] = useState<number>(0);

  const getCardService = async (paramsSearch: IReportCommonFilterRequest) => {
    setIsLoading(true);

    const response = await ReportService.cardService(paramsSearch);

    if (response.code == 0) {
      const result = response.result;

      setLstCardService(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (params.fromTime && params.toTime) {
      getCardService(params);
    }
  }, [params]);

  useEffect(() => {
    let takeMaxTotalCardService = 0;

    if (lstCardService.length > 0) {
      lstCardService.filter((item) => {
        if (takeMaxTotalCardService < item.amount) {
          return (takeMaxTotalCardService = item.amount);
        }
      });

      setMaxTotalCardService(takeMaxTotalCardService);
    }
  }, [lstCardService]);

  return (
    <div className="page__report--cardservice">
      <CustomChartBasic isLoading={isLoading} lstData={lstCardService} totalMax={maxTotalCardService} nameNotification="thẻ dịch vụ" />
    </div>
  );
}
