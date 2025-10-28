import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IOverview } from "model/dashboard/DashboardModel";
import moment from "moment";
import Icon from "components/icon";
import ReportService from "services/ReportService";
import { UserContext, ContextType } from "contexts/userContext";
moment.locale("vi");

interface OverViewProps {
  classNames?: string;
}

export default function OverView(props: OverViewProps) {
  const { classNames } = props;

  const { t } = useTranslation();

  const { isCollapsedSidebar } = useContext(UserContext) as ContextType;

  const [overview, setOverView] = useState<IOverview[]>([
    {
      type: "invoice",
      label: "invoice",
      icon: <Icon name="Report" />,
      old_value: 0,
      current_value: 0,
    },
    {
      type: "returns",
      label: "customer",
      icon: <Icon name="Customer" />,
      old_value: 0,
      current_value: 0,
    },
  ]);

  const [params, setParams] = useState({
    fromTime: "",
    toTime: "",
  });

  useEffect(() => {
    const currentDate = moment().format("DD/MM/yyyy");

    const fourteenDaysAgo = moment().subtract(14, "days").format("DD/MM/yyyy");

    setParams({ fromTime: fourteenDaysAgo, toTime: currentDate });
  }, []);

  const getInvoice = async (paramSearch) => {
    const response = await ReportService.revenue(paramSearch);

    if (response.code == 0) {
      const result = response.result || [];
      // console.log("result", result);

      const totalInvoice = result.map((item) => item.numOrder).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      const sevenDaysCurrent = result
        .slice(7, result.length)
        .map((item) => item.numOrder)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      const sevenDaysAgo = result
        .slice(0, 7)
        .map((item) => item.numOrder)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      setOverView((prevState) =>
        prevState.map((item) => {
          if (item.type == "invoice") {
            return { ...item, old_value: sevenDaysAgo, current_value: sevenDaysCurrent };
          }
          return item;
        })
      );
    }
  };

  const getCustomer = async (paramSearch) => {
    const response = await ReportService.customer(paramSearch);

    if (response.code == 0) {
      const result = response.result || [];

      const totalCustomer = result.map((item) => item.amount).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      const sevenDaysCurrent = result
        .slice(7, result.length)
        .map((item) => item.amount)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      const sevenDaysAgo = result
        .slice(0, 6)
        .map((item) => item.amount)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      setOverView((prevState) =>
        prevState.map((item) => {
          if (item.type == "returns") {
            return { ...item, old_value: sevenDaysAgo, current_value: sevenDaysCurrent };
          }
          return item;
        })
      );
    }
  };

  useEffect(() => {
    if (params.fromTime && params.toTime) {
      getInvoice(params);
      getCustomer(params);
    }
  }, [params]);

  return (
    <div className={`overview d-flex${isCollapsedSidebar ? " overview--sidebar-collapsed" : ""}${classNames ? ` ${classNames}` : ""}`}>
      {overview.map((o, idx) => (
        <div
          key={idx}
          className={`card-box overview-item overview-item__${o.type} 
          overview-item--${o.current_value > o.old_value ? "increase" : "decrease"} 
          d-flex align-items-start justify-content-between`}
        >
          <div className="overview-item__main">
            <div className="d-flex align-items-center">
              <div className="overview-item__icon">{o.icon}</div>
              <div className="overview-item__info">
                <h3>{t(`pageDashboard.${o.label}`)}</h3>
                <time>{moment().format("dddd - DD/MM/yyyy")}</time>
              </div>
            </div>
            <div className="overview-item__note">
              {o.current_value > o.old_value ? (
                <span>
                  Tổng <strong>{o.current_value}</strong> {o.type == "invoice" ? "hóa đơn" : "khách hàng"}. Tăng{" "}
                  <span className="percentage percentage-increase">
                    {o.old_value ? Math.ceil(((o.current_value - o.old_value) / o.old_value) * 100) : 0}%
                  </span>{" "}
                  so với tuần qua
                </span>
              ) : (
                <span>
                  Tổng <strong>{o.current_value}</strong> {o.type == "invoice" ? "hóa đơn" : "khách hàng"}. Giảm{" "}
                  <span className="percentage percentage-decrease">
                    {o.old_value ? Math.ceil(((o.old_value - o.current_value) / o.old_value) * 100) : 0}%
                  </span>{" "}
                  so với tuần qua
                </span>
              )}
            </div>
          </div>
          <div className="overview-item__number d-flex align-items-center justify-content-end">
            {o.current_value > o.old_value ? <Icon name="Increase" /> : <Icon name="Decrease" />} <span>{o.current_value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
