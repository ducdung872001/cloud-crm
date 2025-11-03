import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "components/icon";
import Button from "components/button/button";
import OverView from "./partials/overview";
import Shortcut from "./partials/shortcut";
import Warehouse from "./partials/warehouse";
import EventTransaction from "./partials/eventTransaction";
import VideoHelp from "./partials/videoHelp/videoHelp";
import ReportRevenue from "./partials/reportRevenue";
import ReportProduct from "./partials/reportService";
import InfoBox from "./partials/infoBox";
import Banner from "./partials/banner";
import { useWindowDimensions } from "utils/hookCustom";
import { getDomain } from "reborn-util";
import { getRootDomain, showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import "./index.scss";
import ReportChartService from "services/ReportChartService";
import DashboardInvoice from "components/ChartComponent/partials/DashboardInvoice/DashboardInvoice";
import DashboardCustomer from "components/ChartComponent/partials/DashboardCustomer/DashboardCustomer";
import DashboardReportRevenue from "components/ChartComponent/partials/DashboardReportRevenue/DashboardReportRevenue";

export default function Dashboard() {
  const { t } = useTranslation();

  document.title = t(`pageDashboard.title`);

  const { width } = useWindowDimensions();

  const { setIsShowFeedback } = useContext(UserContext) as ContextType;

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const rootDomain = getRootDomain(sourceDomain);

  const checkTNTechProvider = (sourceDomain: string) => {
    switch (sourceDomain) {
      case "tnteco.reborn.vn":
      case "tnpm.reborn.vn":
      case "imc.reborn.vn":
      case "nhatviet.reborn.vn":
      case "cone.reborn.vn":
      case "crm.tnteco.vn":
      case "crm.apphub.vn":
        return true;
      default:
        return false;
    }
  };

  const checkNotTNTechProvider = (sourceDomain: string) => {
    return (
      sourceDomain !== "tnteco.reborn.vn" &&
      sourceDomain !== "tnpm.reborn.vn" &&
      sourceDomain !== "imc.reborn.vn" &&
      sourceDomain !== "nhatviet.reborn.vn" &&
      sourceDomain !== "cone.reborn.vn" &&
      sourceDomain !== "crm.tnteco.vn" &&
      sourceDomain !== "crm.apphub.vn"
    );
  };

  const [listReportDashboard, setListReportDashboard] = useState([]);

  const getListChart = async () => {
    const response = await ReportChartService.listArtifactByEmployee();

    if (response.code === 0) {
      const result = response.result;
      setListReportDashboard(result || []);
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getListChart();
  }, []);

  const typeChart = (type, width) => {
    switch (type) {
      // case "pie_chart":
      //   return <PieChart/>

      // case "basic_column":
      //   return <BasicColumn/>

      // case "column":
      //   return <Column/>

      // case "line_chart":
      //   return <LineChart/>

      // case "stacked_bar":
      //   return <StackedBar/>

      case "dashboard_invoice":
        return (
          <div style={{ width: `${width === 50 ? "calc(50% - 1.4rem)" : "100%"}` }}>
            <DashboardInvoice />
          </div>
        );

      case "dashboard_customer":
        if (sourceDomain != "tnteco.reborn.vn") {
          return (
            <div style={{ width: `${width === 50 ? "calc(50% - 1.4rem)" : "100%"}` }}>
              <DashboardCustomer />
            </div>
          );
        } else {
          return "";
        }

      case "dashboard_report_revenue":
        return (
          <div style={{ width: `${width === 50 ? "calc(50% - 1.4rem)" : "100%"}` }}>
            <DashboardReportRevenue />
          </div>
        );

      default:
        return "";
    }
  };

  return (
    <div className="page-content page-dashboard d-flex align-items-start justify-content-between">
      <div className={`page-dashboard__left`} style={sourceDomain != "tnteco.reborn.vn" ? { width: "calc(100% - 34.8rem)" } : { width: "100%" }}>
        {width > 991 && (
          <Fragment>
            {/* <OverView />
            <ReportRevenue />
            <ReportProduct /> */}

            {listReportDashboard && listReportDashboard.length > 0 ? (
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                {listReportDashboard.map((item, index) => typeChart(item.code, item.width))}
              </div>
            ) : null}
          </Fragment>
        )}

        {rootDomain == "reborn.vn" && (
          <Fragment>
            {sourceDomain != "tnteco.reborn.vn" && (
              <>
                <InfoBox />
                <div className="d-flex align-items-center justify-content-center" style={{ gap: "2rem" }}>
                  <Button
                    type="button"
                    color="primary"
                    className="btn-question"
                    onClick={(e) => {
                      e && e.preventDefault();
                      window.open("https://ecosystem.reborn.vn/ho-tro/support-crm?query=@linkquestion", "_blank");
                    }}
                  >
                    <Icon name="Chat" /> Những câu hỏi thường gặp
                  </Button>
                  <Button
                    type="button"
                    color="primary"
                    className="btn-question"
                    onClick={(e) => {
                      e && e.preventDefault();
                      setIsShowFeedback(true);
                    }}
                  >
                    <Icon name="Feedback" /> Góp ý cải tiến
                  </Button>
                </div>
              </>
            )}
          </Fragment>
        )}
      </div>
      {sourceDomain != "tnteco.reborn.vn" && (
        // {rootDomain != "tnteco.reborn.vn" && ( nếu là tnteco thì ẩn phần này
        <div className="page-dashboard__right">
          <Shortcut />

          {sourceDomain == "dailyspa.reborn.vn" || sourceDomain == "novacell.reborn.vn" || checkTNTechProvider(sourceDomain) ? (
            <Fragment>
              {width < 991 && (
                <Fragment>
                  <OverView />
                  <ReportRevenue />
                  <ReportProduct />
                </Fragment>
              )}
              {checkNotTNTechProvider(sourceDomain) && (
                <div className="card-box banner__dashboard">
                  <Banner />
                </div>
              )}
              {/* <Warehouse /> */}
              {/* <EventTransaction /> */}
              {width > 767 && <VideoHelp />}
            </Fragment>
          ) : (
            <Fragment>
              {width < 991 && (
                <Fragment>
                  <OverView />
                  <ReportRevenue />
                  <ReportProduct />
                </Fragment>
              )}
              <div className="card-box banner__dashboard">
                <Banner />
              </div>
              <Warehouse />
              <EventTransaction />
              {width > 767 && <VideoHelp />}
            </Fragment>
          )}

          {/* {rootDomain == "reborn.vn" && (
          <Fragment>
            {width < 991 && (
              <Fragment>
                <OverView />
                <ReportRevenue />
                <ReportProduct />
              </Fragment>
            )}
            <div className="card-box banner__dashboard">
              <Banner />
            </div>
            <Warehouse />
            <EventTransaction />
            {width > 767 && <VideoHelp />}
          </Fragment>
        )} */}
        </div>
      )}
    </div>
  );
}
