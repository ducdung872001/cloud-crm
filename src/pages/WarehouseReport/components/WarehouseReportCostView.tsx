import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { createCostGroupOptions, createCostPeriodOptions } from "../chartOptions";
import { COST_KPIS, COST_TABLE_ROWS } from "../mockData";
import WarehouseReportActions from "./WarehouseReportActions";
import WarehouseReportFilterBar from "./WarehouseReportFilterBar";
import WarehouseReportKpis from "./WarehouseReportKpis";

export default function WarehouseReportCostView() {
  const groupOptions = useMemo<Highcharts.Options>(() => createCostGroupOptions(), []);
  const periodOptions = useMemo<Highcharts.Options>(() => createCostPeriodOptions(), []);

  return (
    <div className="warehouse-report-view">
      <div className="page-header page-header--split">
        <div>
          <div className="page-eyebrow">Báo cáo kho</div>
          <div className="page-title">Giá vốn hàng tồn</div>
        </div>
        <WarehouseReportActions secondary="⬇ Xuất Excel" primary="📌 Phân tích biên lợi nhuận" />
      </div>
      <WarehouseReportFilterBar leftLabel="Phương pháp:" leftButtons={["Bình quân", "FIFO"]} selects={["Tất cả kho", "Tất cả nhóm hàng"]} actionLabel="Xem báo cáo" />
      <WarehouseReportKpis items={COST_KPIS} />
      <div className="chart-row">
        <div className="chart-card">
          <div className="cc-title">Giá trị tồn theo nhóm hàng</div>
          <div className="cc-sub">Đơn vị: triệu đồng</div>
          <HighchartsReact highcharts={Highcharts} options={groupOptions} />
        </div>
        <div className="chart-card">
          <div className="cc-title">Xu hướng giá vốn theo kỳ</div>
          <div className="cc-sub">So sánh giá trị tồn và giá vốn</div>
          <div className="legend">
            <div className="li"><span className="ld" style={{ background: "#047857" }} />Giá trị tồn</div>
            <div className="li"><span className="ld" style={{ background: "#f59e0b" }} />Giá vốn</div>
          </div>
          <HighchartsReact highcharts={Highcharts} options={periodOptions} />
        </div>
      </div>
      <div className="tbl-card">
        <div className="tbl-head">
          <h3>Chi tiết giá vốn theo sản phẩm</h3>
          <span className="tbl-meta">4 sản phẩm đại diện</span>
        </div>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th><th>Mã SP</th><th className="r">Tồn SL</th><th className="r">Giá vốn</th><th className="r">Giá trị tồn</th><th className="r">Giá bán TB</th><th className="r">Lợi nhuận gộp</th>
              </tr>
            </thead>
            <tbody>
              {COST_TABLE_ROWS.map((item) => (
                <tr key={item.sku}>
                  <td>{item.product}</td><td>{item.sku}</td><td className="r">{item.quantity}</td><td className="r">{item.unitCost}</td><td className="r va">{item.inventoryValue}</td><td className="r">{item.avgPrice}</td><td className="r vg">{item.grossMargin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
