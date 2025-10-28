import React, { useEffect, useState } from "react";
import { IReportCommonProps } from "model/report/PropsModel";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import { IReportProductResponse } from "model/report/ReportResponse";
import CustomChartBasic from "components/customChartBasic/customChartBasic";
import ReportService from "services/ReportService";
import { showToast } from "utils/common";
import "./ReportProduct.scss";

export default function ReportProduct(props: IReportCommonProps) {
  const { params } = props;

  const [listProduct, setListProduct] = useState<IReportProductResponse[]>([]);
  const [maxTotalProduct, setMaxTotalProduct] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getProduct = async (paramsSearch: IReportCommonFilterRequest) => {
    setIsLoading(true);

    const response = await ReportService.product(paramsSearch);

    if (response.code == 0) {
      const result = response.result;

      setListProduct(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (params.fromTime && params.toTime) {
      getProduct(params);
    }
  }, [params]);

  useEffect(() => {
    let takeMaxTotalProduct = 0;

    if (listProduct.length > 0) {
      listProduct.filter((item) => {
        if (takeMaxTotalProduct < item.amount) {
          return (takeMaxTotalProduct = item.amount);
        }
      });

      setMaxTotalProduct(takeMaxTotalProduct);
    }
  }, [listProduct]);

  return (
    <div className="page__report--product">
      <CustomChartBasic isLoading={isLoading} lstData={listProduct} totalMax={maxTotalProduct} nameNotification="sản phẩm" />
    </div>
  );
}
