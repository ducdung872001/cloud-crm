import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { createXntTrendOptions, createXntWarehouseRatioOptions } from "../chartOptions";
import { XNT_KPIS, XNT_TABLE_ROWS } from "../mockData";
import WarehouseReportActions from "./WarehouseReportActions";
import WarehouseReportFilterBar from "./WarehouseReportFilterBar";
import WarehouseReportKpis from "./WarehouseReportKpis";

export default function WarehouseReportXntView() {
  const trendOptions = useMemo<Highcharts.Options>(() => createXntTrendOptions(), []);
  const ratioOptions = useMemo<Highcharts.Options>(() => createXntWarehouseRatioOptions(), []);

  return (
    <div className="warehouse-report-view">
      {/* <div className="page-header page-header--split">
        <div>
        </div>
        <WarehouseReportActions secondary="⬇ Xuất Excel" primary="🖨 In báo cáo" />
      </div> */}
      <WarehouseReportFilterBar leftLabel="Kỳ:" leftButtons={["Tháng 3/2026", "Quý 1/2026", "Tùy chỉnh"]} selects={["Tất cả kho", "Tất cả nhóm"]} actionLabel="Xem báo cáo" />
      <WarehouseReportKpis items={XNT_KPIS} />
      <div className="chart-row">
        <div className="chart-card">
          <div className="cc-title">Biến động nhập / xuất theo ngày</div>
          <div className="cc-sub">Theo số lượng sản phẩm trong tháng 3/2026</div>
          <div className="legend">
            <div className="li"><span className="ld" style={{ background: "#1d4ed8" }} />Nhập kho</div>
            <div className="li"><span className="ld" style={{ background: "#f97316" }} />Xuất kho</div>
          </div>
          <HighchartsReact highcharts={Highcharts} options={trendOptions} />
        </div>
        <div className="chart-card">
          <div className="cc-title">Phân bổ tồn kho theo kho</div>
          <div className="cc-sub">Tỷ trọng hàng tồn cuối kỳ</div>
          <div className="legend">
            <div className="li"><span className="ld" style={{ background: "#1d4ed8" }} />Kho HN 48%</div>
            <div className="li"><span className="ld" style={{ background: "#60a5fa" }} />Kho HCM 32%</div>
            <div className="li"><span className="ld" style={{ background: "#bfdbfe" }} />Kho ĐN 20%</div>
          </div>
          <HighchartsReact highcharts={Highcharts} options={ratioOptions} />
        </div>
      </div>
      <div className="tbl-card">
        <div className="tbl-head">
          <h3>Chi tiết nhập xuất tồn theo sản phẩm</h3>
          <span className="tbl-meta">Tháng 3/2026 · 4 sản phẩm mẫu</span>
        </div>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th><th>Mã SP</th><th className="r">Tồn đầu</th><th className="r">Nhập</th><th className="r">Xuất</th><th className="r">Tồn cuối</th><th>Kho</th>
              </tr>
            </thead>
            <tbody>
              {XNT_TABLE_ROWS.map((item) => (
                <tr key={item.sku}>
                  <td>{item.product}</td><td>{item.sku}</td><td className="r">{item.opening}</td><td className="r vg">{item.importQty}</td><td className="r vr">{item.exportQty}</td><td className="r">{item.closing}</td><td>{item.warehouse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
