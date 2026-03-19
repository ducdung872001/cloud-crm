import React, { Fragment, useMemo, useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { HEALTH_DATA } from "./mockData";
import { createClosingOptions, createHealthOptions, createMovementOptions } from "./chartOptions";
import InventoryFilterBar from "./components/InventoryFilterBar";
import InventoryKpiGrid from "./components/InventoryKpiGrid";
import InventoryWarehouseSummary from "./components/InventoryWarehouseSummary";
import InventoryProductTable from "./components/InventoryProductTable";
import "./InventoryReportModern.scss";

export default function InventoryReportModern() {
  document.title = "Báo cáo tồn kho";

  const [groupBy, setGroupBy] = useState("month");
  const [warehouseId, setWarehouseId] = useState(0);
  const [dateRange, setDateRange] = useState<[string, string]>([
    moment().subtract(5, "months").startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);

  const movementOptions = useMemo<Highcharts.Options>(() => createMovementOptions(), [groupBy, warehouseId, dateRange]);
  const closingOptions = useMemo<Highcharts.Options>(() => createClosingOptions(), [groupBy, warehouseId]);
  const healthOptions = useMemo<Highcharts.Options>(() => createHealthOptions(), [warehouseId]);

  return (
    <Fragment>
      <div className="page-content page-inventory-report-modern">
        <TitleAction title="Báo cáo tồn kho" />

        <InventoryFilterBar
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <InventoryKpiGrid />

        <div className="report-grid">
          <div className="report-panel report-panel--wide">
            <div className="report-panel__header">
              <div className="report-panel__title">Biến động nhập xuất tồn</div>
              <div className="report-panel__sub">So sánh nhập, xuất và điều chỉnh trong kỳ</div>
            </div>
            <HighchartsReact highcharts={Highcharts} options={movementOptions} />
          </div>

          <div className="report-panel">
            <div className="report-panel__header">
              <div className="report-panel__title">Sức khỏe tồn kho</div>
              <div className="report-panel__sub">Phân loại theo mức cảnh báo</div>
            </div>
            <HighchartsReact highcharts={Highcharts} options={healthOptions} />
            <div className="report-legend">
              {HEALTH_DATA.map((item) => (
                <div key={item.name} className="report-legend__item">
                  <span className="report-legend__dot" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <strong>{item.y}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="report-panel report-panel--wide">
            <div className="report-panel__header">
              <div className="report-panel__title">Xu hướng tồn cuối kỳ</div>
              <div className="report-panel__sub">Theo dõi lượng tồn còn lại theo chu kỳ</div>
            </div>
            <HighchartsReact highcharts={Highcharts} options={closingOptions} />
          </div>

          <InventoryWarehouseSummary />
        </div>
        <InventoryProductTable />
      </div>
    </Fragment>
  );
}
