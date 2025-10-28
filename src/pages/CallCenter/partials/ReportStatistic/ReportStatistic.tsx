import React, { useContext, useEffect, useRef, useState } from "react";

import "./ReportStatistic.scss";
import { ContextType, UserContext } from "contexts/userContext";
import PerformanceEmployee from "./partials/PerformanceEmployee/PerformanceEmployee";
import CallAnalysis from "./partials/CallAnalysis/CallAnalysis";
import ReportOverview from "./partials/ReportOverview/ReportOverview";
import IncomingCall from "./partials/IncomingCall/IncomingCall";
import OutgoingCall from "./partials/OutgoingCall/OutgoingCall";
import ReportTimeCall from "./partials/ReportTimeCall/ReportTimeCall";

export default function ReportStatistic() {

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
    <div className="page__statistic_call_center">
      <div className="body__demo--graphic">
        <div style={{display:'flex', justifyContent:'flex-end'}}>
          {/* <FilterContract updateParams={takeFromTimeAndToTime} /> */}
        </div>
        <div style={{marginTop: '1rem'}}>
            <ReportOverview paramsTime = {params}/>
        </div>

        <div style={{marginTop: '1rem'}}>
            <OutgoingCall paramsTime = {params}/>
        </div>

        <div style={{marginTop: '1rem'}}>
            <IncomingCall paramsTime = {params}/>
        </div>

        <div style={{marginTop: '1rem'}}>
            <ReportTimeCall paramsTime = {params}/>
        </div>
        {/* <div style={{marginTop: '1rem'}}>
            <PerformanceEmployee paramsTime = {params}/>
        </div>

        <div className="card-box" style={{marginTop: '3rem', padding: '1.6rem'}}>
          <CallAnalysis paramsTime = {params}/>
        </div> */}
       
       
      </div>
    </div>
  );
}
