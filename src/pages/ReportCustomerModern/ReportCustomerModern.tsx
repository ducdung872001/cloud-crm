import React, { Fragment, useMemo, useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { TIER_DATA } from "./mockData";
import { createGrowthOptions, createRegionOptions, createReturnOptions, createTierOptions } from "./chartOptions";
import CustomerFilterBar from "./components/CustomerFilterBar";
import CustomerKpiGrid from "./components/CustomerKpiGrid";
import CustomerTopTable from "./components/CustomerTopTable";
import "./ReportCustomerModern.scss";

export default function ReportCustomerModern() {
  document.title = "Báo cáo khách hàng";

  const [activeRange, setActiveRange] = useState("today");
  const [source, setSource] = useState("all");
  const [dateRange, setDateRange] = useState<[string, string]>([
    moment().startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);

  const growthOptions = useMemo<Highcharts.Options>(() => createGrowthOptions(), [activeRange]);
  const tierOptions = useMemo<Highcharts.Options>(() => createTierOptions(), [source]);
  const returnOptions = useMemo<Highcharts.Options>(() => createReturnOptions(), [activeRange, source]);
  const regionOptions = useMemo<Highcharts.Options>(() => createRegionOptions(), [source]);

  return (
    <Fragment>
      <div className="page-content page-customer-report-modern">
        <TitleAction title="Báo cáo khách hàng" />

        <CustomerFilterBar
          activeRange={activeRange}
          setActiveRange={setActiveRange}
          source={source}
          setSource={setSource}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <CustomerKpiGrid />

        <div className="chart-row">
          <div className="chart-card">
            <div className="chart-title">Khách hàng mới theo tuần</div>
            <div className="chart-subtitle">Tháng 3 / 2026</div>
            <div className="chart-wrap"><HighchartsReact highcharts={Highcharts} options={growthOptions} /></div>
          </div>
          <div className="chart-card">
            <div className="chart-title">Phân loại khách hàng</div>
            <div className="chart-subtitle">Theo hạng tích lũy</div>
            <div className="legend">
              {TIER_DATA.map((item) => (
                <div key={item.name} className="legend-item">
                  <span className="legend-dot" style={{ background: item.color }} />
                  {item.name} {item.y}%
                </div>
              ))}
            </div>
            <div className="chart-wrap chart-wrap--small"><HighchartsReact highcharts={Highcharts} options={tierOptions} /></div>
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-card">
            <div className="chart-title">Tăng trưởng khách hàng quay lại</div>
            <div className="chart-subtitle">So sánh khách mới và khách quay lại theo tháng</div>
            <div className="legend">
              <div className="legend-item"><span className="legend-dot" style={{ background: "#8b5cf6" }} />Khách mới</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: "#2563eb" }} />Khách quay lại</div>
            </div>
            <div className="chart-wrap"><HighchartsReact highcharts={Highcharts} options={returnOptions} /></div>
          </div>
          <div className="chart-card">
            <div className="chart-title">Phân bố khách hàng</div>
            <div className="chart-subtitle">Theo khu vực mua hàng chính</div>
            <div className="chart-wrap"><HighchartsReact highcharts={Highcharts} options={regionOptions} /></div>
          </div>
        </div>

        <CustomerTopTable />
      </div>
    </Fragment>
  );
}
