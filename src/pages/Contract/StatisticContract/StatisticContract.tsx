import React, { useContext, useEffect, useRef, useState } from "react";
import Icon from "components/icon";
import Input from "components/input/input";
import { useOnClickOutside } from "utils/hookCustom";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";

import "./StatisticContract.scss";
import ReportContractStatus from "./partials/ReportContractStatus/ReportContractStatus";
import ReportContractValue from "./partials/ReportContractValue/ReportContractValue";
import { ContextType, UserContext } from "contexts/userContext";
import ReportContractPerformance from "./partials/ReportContractPerformance/ReportContractPerformance";
import ReportNewContract from "./partials/ReportNewContract/ReportNewContract";
import FilterContract from "./partials/FilterContract/FilterContract";

export default function StatisticContract() {

  const { dataBranch } = useContext(UserContext) as ContextType;

  const [params, setParams] = useState({
    fromTime: "",
    toTime: "",
  });

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, fromTime: fromTime, toTime: toTime });
    }
  };

  return (
    <div className="page__statistic_contract">
      <div className="body__demo--graphic">
        {/* <div style={{display:'flex', justifyContent:'flex-end'}}>
          <FilterContract updateParams={takeFromTimeAndToTime} />
        </div> */}
        {/* <div className="__top--graphic">
          <ReportContractStatus paramsTime = {params}/>
        </div> */}
        <div style={{marginTop: '1rem'}}>
          <ReportContractStatus paramsTime = {params}/>
        </div>
        <div style={{marginTop: '3rem'}}>
            <ReportContractValue paramsTime = {params}/>
        </div>
        {/* <div style={{marginTop: '2rem'}}>
            <ReportContractPerformance/>
        </div> */}
        <div style={{marginTop: '3rem'}}>
            <ReportNewContract/>
        </div>

        <div className="__bottom--graphic">
          {/* <AccordingBehaviInteres branchId={dataBranch?.value} />
          <AccordingProvincialDistribution branchId={dataBranch?.value} /> */}
        </div>
      </div>
    </div>
  );
}
