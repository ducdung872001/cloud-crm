import React, { Fragment, useMemo, useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import "./InventoryReportModern.scss";

const GROUP_OPTIONS = [
  { value: "month", label: "Theo tháng" },
  { value: "week", label: "Theo tuần" },
  { value: "day", label: "Theo ngày" },
];

const WAREHOUSE_OPTIONS = [
  { value: 0, label: "Tất cả kho" },
  { value: 1, label: "Kho trung tâm" },
  { value: 2, label: "Kho Hà Nội" },
  { value: 3, label: "Kho Đà Nẵng" },
  { value: 4, label: "Kho online" },
];

const MOVEMENT_DATA = [
  { label: "T10", importQty: 1650, exportQty: 1240, adjustmentQty: 35, closingQty: 2015 },
  { label: "T11", importQty: 1820, exportQty: 1395, adjustmentQty: 28, closingQty: 2140 },
  { label: "T12", importQty: 2050, exportQty: 1625, adjustmentQty: 44, closingQty: 2278 },
  { label: "T01", importQty: 2180, exportQty: 1710, adjustmentQty: 32, closingQty: 2395 },
  { label: "T02", importQty: 1960, exportQty: 1540, adjustmentQty: 21, closingQty: 2460 },
  { label: "T03", importQty: 2240, exportQty: 1815, adjustmentQty: 39, closingQty: 2580 },
];

const HEALTH_DATA = [
  { name: "Ổn định", y: 18, color: "#10b981" },
  { name: "Cần theo dõi", y: 9, color: "#f59e0b" },
  { name: "Sắp thiếu", y: 4, color: "#ef4444" },
];

const WAREHOUSE_DATA = [
  { name: "Kho trung tâm", closingQty: 2640, stockValue: 1850000000 },
  { name: "Kho Hà Nội", closingQty: 980, stockValue: 620000000 },
  { name: "Kho Đà Nẵng", closingQty: 720, stockValue: 418000000 },
  { name: "Kho online", closingQty: 410, stockValue: 267000000 },
];

const PRODUCT_ROWS = [
  { sku: "SP-001", productName: "Serum phục hồi da", warehouseName: "Kho trung tâm", closingQty: 420, availableQty: 388, stockValue: 264000000, turnoverDays: 21, status: "Ổn định", color: "#10b981" },
  { sku: "SP-014", productName: "Kem chống nắng SPF50", warehouseName: "Kho Hà Nội", closingQty: 82, availableQty: 70, stockValue: 45920000, turnoverDays: 46, status: "Cần theo dõi", color: "#f59e0b" },
  { sku: "SP-122", productName: "Tinh dầu trị liệu", warehouseName: "Kho online", closingQty: 24, availableQty: 18, stockValue: 12750000, turnoverDays: 65, status: "Sắp thiếu", color: "#ef4444" },
  { sku: "SP-075", productName: "Combo dưỡng ẩm chuyên sâu", warehouseName: "Kho trung tâm", closingQty: 138, availableQty: 125, stockValue: 103500000, turnoverDays: 34, status: "Ổn định", color: "#10b981" },
];

Highcharts.setOptions({
  lang: {
    thousandsSep: ".",
    decimalPoint: ",",
  },
  chart: {
    style: { fontFamily: "inherit" },
  },
});

export default function InventoryReportModern() {
  document.title = "Báo cáo tồn kho";

  const [groupBy, setGroupBy] = useState("month");
  const [warehouseId, setWarehouseId] = useState(0);
  const [dateRange, setDateRange] = useState<[string, string]>([
    moment().subtract(5, "months").startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);

  const movementOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "column", height: 320, backgroundColor: "transparent" },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: { categories: MOVEMENT_DATA.map((item) => item.label), lineColor: "#e5e7eb" },
      yAxis: { title: { text: undefined }, gridLineColor: "#f3f4f6" },
      plotOptions: { column: { borderRadius: 4 } },
      series: [
        { type: "column", name: "Nhập", data: MOVEMENT_DATA.map((item) => item.importQty), color: "#3b82f6" },
        { type: "column", name: "Xuất", data: MOVEMENT_DATA.map((item) => item.exportQty), color: "#14b8a6" },
        { type: "column", name: "Điều chỉnh", data: MOVEMENT_DATA.map((item) => item.adjustmentQty), color: "#f59e0b" },
      ],
    }),
    [groupBy, warehouseId, dateRange]
  );

  const closingOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "areaspline", height: 320, backgroundColor: "transparent" },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: { categories: MOVEMENT_DATA.map((item) => item.label), lineColor: "#e5e7eb" },
      yAxis: { title: { text: undefined }, gridLineColor: "#f3f4f6" },
      plotOptions: { areaspline: { lineWidth: 2, marker: { enabled: false }, fillOpacity: 0.18 } },
      series: [{ type: "areaspline", name: "Tồn cuối kỳ", data: MOVEMENT_DATA.map((item) => item.closingQty), color: "#7c3aed" }],
    }),
    [groupBy, warehouseId]
  );

  const healthOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "pie", height: 260, backgroundColor: "transparent" },
      title: { text: undefined },
      credits: { enabled: false },
      plotOptions: { pie: { innerSize: "68%", borderWidth: 0, dataLabels: { enabled: false } } },
      series: [{ type: "pie", data: HEALTH_DATA }],
    }),
    [warehouseId]
  );

  return (
    <Fragment>
      <div className="page-content page-inventory-report-modern">
        <TitleAction title="Báo cáo tồn kho" />

        <div className="report-toolbar">
          <div className="report-toolbar__item">
            <label>Kho</label>
            <SelectCustom id="inventoryModernWarehouse" name="inventoryModernWarehouse" options={WAREHOUSE_OPTIONS} fill value={warehouseId} onChange={(option) => setWarehouseId(option.value)} />
          </div>
          <div className="report-toolbar__item">
            <label>Nhóm dữ liệu</label>
            <SelectCustom id="inventoryModernGroup" name="inventoryModernGroup" options={GROUP_OPTIONS} fill value={groupBy} onChange={(option) => setGroupBy(option.value)} />
          </div>
          <div className="report-toolbar__item report-toolbar__item--date">
            <label>Khoảng thời gian</label>
            <DatePickerCustom value={dateRange} onChange={(range) => setDateRange(range)} placeholder="Chọn khoảng ngày..." />
          </div>
        </div>

        <div className="report-kpi-grid">
          <div className="report-kpi-card"><div className="report-kpi-card__label">Tổng nhập trong kỳ</div><div className="report-kpi-card__value">9.860</div><div className="report-kpi-card__note">Số lượng nhập kho</div></div>
          <div className="report-kpi-card"><div className="report-kpi-card__label">Tổng xuất trong kỳ</div><div className="report-kpi-card__value">7.325</div><div className="report-kpi-card__note">Số lượng xuất kho</div></div>
          <div className="report-kpi-card"><div className="report-kpi-card__label">Tồn cuối kỳ</div><div className="report-kpi-card__value">4.750</div><div className="report-kpi-card__note">Số lượng còn lại</div></div>
          <div className="report-kpi-card"><div className="report-kpi-card__label">Giá trị tồn kho</div><div className="report-kpi-card__value">{formatCurrency(3155000000)} đ</div><div className="report-kpi-card__note">Giá vốn đang lưu kho</div></div>
          <div className="report-kpi-card"><div className="report-kpi-card__label">Cảnh báo dưới ngưỡng</div><div className="report-kpi-card__value">34</div><div className="report-kpi-card__note">SKU cần bổ sung</div></div>
        </div>

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

          <div className="report-panel">
            <div className="report-panel__header">
              <div className="report-panel__title">Hiệu suất theo kho</div>
              <div className="report-panel__sub">Tồn và giá trị từng kho</div>
            </div>
            <div className="warehouse-summary-list">
              {WAREHOUSE_DATA.map((item) => (
                <div key={item.name} className="warehouse-summary-item">
                  <div className="warehouse-summary-item__name">{item.name}</div>
                  <div className="warehouse-summary-item__meta">
                    <span>Tồn: {item.closingQty.toLocaleString("vi-VN")}</span>
                    <span>Giá trị: {formatCurrency(item.stockValue)} đ</span>
                  </div>
                  <div className="warehouse-summary-item__bar">
                    <div className="warehouse-summary-item__fill" style={{ width: `${Math.min(100, Math.round((item.closingQty / 2640) * 100))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="report-table-card">
          <div className="report-table-card__header">
            <div>
              <div className="report-panel__title">Chi tiết sản phẩm tồn kho</div>
              <div className="report-panel__sub">Danh sách SKU cần theo dõi trong kỳ báo cáo</div>
            </div>
          </div>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Sản phẩm</th>
                  <th>Kho</th>
                  <th className="text-right">Tồn cuối</th>
                  <th className="text-right">Khả dụng</th>
                  <th className="text-right">Giá trị tồn</th>
                  <th className="text-right">Số ngày luân chuyển</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCT_ROWS.map((item) => (
                  <tr key={item.sku}>
                    <td className="font-semibold">{item.sku}</td>
                    <td>{item.productName}</td>
                    <td>{item.warehouseName}</td>
                    <td className="text-right">{item.closingQty.toLocaleString("vi-VN")}</td>
                    <td className="text-right">{item.availableQty.toLocaleString("vi-VN")}</td>
                    <td className="text-right">{formatCurrency(item.stockValue)} đ</td>
                    <td className="text-right">{item.turnoverDays}</td>
                    <td><span className="report-status" style={{ "--status-color": item.color } as React.CSSProperties}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
