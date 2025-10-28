import Icon from "components/icon";
import React, { useContext, useEffect, useState } from "react";
import ChartCustomerJob from "./ChartCustomerJob";
import ChartCustomerType from "./ChartCustomerType";
import ChartActionByCustomerType from "./ChartActionByCustomerType";
import ChartActionDaily from "./ChartActionDaily";
import ChartActionCumulative from "./ChartActionCumulative";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import EmployeeService from "services/EmployeeService";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import ImageThirdGender from "assets/images/third-gender.png";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import CustomerService from "services/CustomerService";
import ChartOptNewDaily from "./ChartOptNewDaily";
import ReportGuaranteeService from "services/ReportGuaranteeService";

interface ICardItem {
  icon: any;
  name: string;
  value: string;
  color: "total" | "out-date" | "success" | "today" | "remaining" | "average" | "early";
  unit?: string;
  rate?: string;
}

type IReportCard = ICardItem[];

export default function ReportGuarantee() {
  const [params, setParams] = useState({
    startTime: "",
    endTime: "",
  });
  const [data, setData] = useState(null);
  const fetchData = async () => {
    const response = await ReportGuaranteeService.reportGuarantee(params);
    if (response.code === 0) {
      setData(response.result);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="report-guarantee">
      <div className="report_chart">
        <ChartCustomerJob paramsProps={params} data={data} />
      </div>
    </div>
  );
}
