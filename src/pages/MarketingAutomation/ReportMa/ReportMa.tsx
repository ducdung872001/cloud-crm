import React, { useEffect, useState } from "react";
import "./ReportMa.scss";
import ReportEmail from "./patials/ReportEmail";
import ReportSMS from "./patials/ReportSMS";
import ReportZalo from "./patials/ReportZalo";
import ReportMaService from "services/ReportMaService";

export default function ReportMa({ dataMaReport }) {
  document.title = "Báo cáo MA";

  const [lstTitleHeader, setLstTitleHeader] = useState([
    {
      name: "Email Marketing",
      type: 1,
    },
    {
      name: "SMS Marketing",
      type: 2,
    },
    {
      name: "Zalo Marketing",
      type: 3,
    },
  ]);
  const [activeTitleHeader, setActiveTitleHeader] = useState(1);

  const fetchDataCustomer = async () => {
    const params = {
      startDate: "",
      endDate: "",
      type: "customer_email", // customer_email,customer_sms, customer_zalo
      bsnId: "",
      maId: 81,
    };
    const response = await ReportMaService.getCustomer(params);
    if (response.code === 0) {
      console.log(response);
    }
  };

  useEffect(() => {
    fetchDataCustomer();
  }, []);

  return (
    <div className="report-ma">
      <ul className="line__height--project">
        {lstTitleHeader.map((item, idx) => {
          return (
            <li
              key={idx}
              className={`item-title ${activeTitleHeader === item.type ? "active__item--title" : ""}`}
              onClick={() => {
                setActiveTitleHeader(item.type);
              }}
            >
              {item.name}
            </li>
          );
        })}
      </ul>
      <div className="report">
        {activeTitleHeader === 1 ? <ReportEmail dataCampaign={dataMaReport} /> : activeTitleHeader === 2 ? <ReportSMS /> : <ReportZalo />}
      </div>
    </div>
  );
}
