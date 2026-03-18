import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { createHistoryFlowOptions, createHistoryStockOptions } from "../chartOptions";
import { HISTORY_KPIS, HISTORY_TABLE_ROWS } from "../mockData";
import WarehouseReportActions from "./WarehouseReportActions";
import WarehouseReportFilterBar from "./WarehouseReportFilterBar";
import WarehouseReportKpis from "./WarehouseReportKpis";

export default function WarehouseReportHistoryView() {
  const stockOptions = useMemo<Highcharts.Options>(() => createHistoryStockOptions(), []);
  const flowOptions = useMemo<Highcharts.Options>(() => createHistoryFlowOptions(), []);

  return (
    <div className="warehouse-report-view">
      <div className="page-header page-header--split">
        <div>
          <div className="page-eyebrow">Báo cáo kho</div>
          <div className="page-title">Lịch sử theo sản phẩm</div>
        </div>
        <WarehouseReportActions secondary="⬇ Xuất Excel" />
      </div>
      <WarehouseReportFilterBar leftLabel="Sản phẩm:" leftButtons={["Áo thun nam basic (SP001)"]} middleLabel="Kỳ:" middleButtons={["Tháng 3", "Quý 1", "6 tháng", "Cả năm"]} selects={["Tất cả kho"]} actionLabel="Xem lịch sử" />
      <div className="product-info-card">
        <div className="product-info-card__icon">👕</div>
        <div className="product-info-card__body">
          <div className="product-info-card__title">Áo thun nam basic</div>
          <div className="product-info-card__desc">SP001 · Thời trang · Barcode: 8938512340012</div>
        </div>
      </div>
      <WarehouseReportKpis items={HISTORY_KPIS} />
      <div className="chart-row">
        <div className="chart-card">
          <div className="cc-title">Biến động tồn kho theo ngày</div>
          <div className="cc-sub">Tháng 3/2026 · Áo thun nam basic (SP001)</div>
          <HighchartsReact highcharts={Highcharts} options={stockOptions} />
        </div>
        <div className="chart-card">
          <div className="cc-title">Nhập / Xuất theo tuần</div>
          <div className="cc-sub">4 tuần gần nhất</div>
          <div className="legend">
            <div className="li"><span className="ld" style={{ background: "#1d4ed8" }} />Nhập kho</div>
            <div className="li"><span className="ld" style={{ background: "#f97316" }} />Xuất kho</div>
          </div>
          <HighchartsReact highcharts={Highcharts} options={flowOptions} />
        </div>
      </div>
      <div className="tbl-card">
        <div className="tbl-head">
          <h3>Lịch sử biến động — Áo thun nam basic (SP001)</h3>
          <span className="tbl-meta">Tháng 3/2026 · 24 giao dịch</span>
        </div>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>Ngày</th><th>Loại giao dịch</th><th>Chứng từ</th><th className="r">Nhập</th><th className="r">Xuất</th><th className="r">Tồn sau GD</th><th className="r">Giá vốn đơn</th><th>Kho</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY_TABLE_ROWS.map((item) => (
                <tr key={`${item.date}-${item.code}`}>
                  <td>{item.date}</td><td><span className={`badge ${item.typeClass}`}>{item.type}</span></td><td className="vb">{item.code}</td><td className="r vg">{item.importQty}</td><td className="r vr">{item.exportQty}</td><td className="r">{item.remain}</td><td className="r">{item.unitCost}</td><td>{item.warehouse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
