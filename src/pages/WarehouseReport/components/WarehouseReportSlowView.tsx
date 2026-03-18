import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { createSlowDaysOptions, createSlowGroupOptions } from "../chartOptions";
import { SLOW_KPIS, SLOW_TABLE_ROWS } from "../mockData";
import WarehouseReportActions from "./WarehouseReportActions";
import WarehouseReportFilterBar from "./WarehouseReportFilterBar";
import WarehouseReportKpis from "./WarehouseReportKpis";

export default function WarehouseReportSlowView() {
  const daysOptions = useMemo<Highcharts.Options>(() => createSlowDaysOptions(), []);
  const groupOptions = useMemo<Highcharts.Options>(() => createSlowGroupOptions(), []);

  return (
    <div className="warehouse-report-view">
      <div className="page-header page-header--split">
        <div>
          <div className="page-eyebrow">Báo cáo kho</div>
          <div className="page-title">Hàng chậm luân chuyển</div>
        </div>
        <WarehouseReportActions secondary="⬇ Xuất Excel" primary="📌 Đề xuất xử lý" />
      </div>
      <WarehouseReportFilterBar leftLabel="Tồn quá:" leftButtons={["90 ngày", "60 ngày", "30 ngày", "180 ngày"]} selects={["Tất cả nhóm", "Tất cả kho"]} actionLabel="Lọc" />
      <div className="alert-banner">
        <span className="alert-banner__icon">⚠️</span>
        <div>
          <div className="alert-banner__title">Phát hiện 34 sản phẩm chậm luân chuyển trên 90 ngày</div>
          <div className="alert-banner__desc">Tổng giá trị ứ đọng ước tính: <b>142.6M đồng</b> · Cần xem xét khuyến mãi hoặc điều chuyển kho</div>
        </div>
      </div>
      <WarehouseReportKpis items={SLOW_KPIS} />
      <div className="chart-row">
        <div className="chart-card">
          <div className="cc-title">Phân bổ theo số ngày tồn kho</div>
          <div className="cc-sub">Số sản phẩm chậm luân chuyển theo mức độ</div>
          <div className="legend">
            <div className="li"><span className="ld" style={{ background: "#fbbf24" }} />90–120 ngày (15 SP)</div>
            <div className="li"><span className="ld" style={{ background: "#f97316" }} />120–180 ngày (12 SP)</div>
            <div className="li"><span className="ld" style={{ background: "#ef4444" }} />&gt; 180 ngày (7 SP)</div>
          </div>
          <HighchartsReact highcharts={Highcharts} options={daysOptions} />
        </div>
        <div className="chart-card">
          <div className="cc-title">Top nhóm hàng chậm luân chuyển</div>
          <div className="cc-sub">Theo giá trị ứ đọng · Triệu đồng</div>
          <HighchartsReact highcharts={Highcharts} options={groupOptions} />
        </div>
      </div>
      <div className="tbl-card">
        <div className="tbl-head">
          <h3>Danh sách hàng chậm luân chuyển (&gt; 90 ngày)</h3>
          <span className="tbl-meta">34 sản phẩm · Sắp xếp theo số ngày tồn</span>
        </div>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th><th>Nhóm</th><th className="r">Tồn SL</th><th className="r">Ngày tồn</th><th className="r">Giá vốn ứ đọng</th><th className="r">Lần xuất cuối</th><th>Đề xuất</th>
              </tr>
            </thead>
            <tbody>
              {SLOW_TABLE_ROWS.map((item) => (
                <tr key={item.sku}>
                  <td><div className="table-primary">{item.product}</div><div className="table-secondary">{item.sku}</div></td>
                  <td>{item.group}</td><td className="r">{item.stock}</td><td className="r vr">{item.days}</td><td className="r va">{item.lockedValue}</td><td className="r">{item.lastOutDate}</td><td><span className={`badge ${item.actionClass}`}>{item.action}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
