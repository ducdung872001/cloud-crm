import React, { Fragment, useMemo, useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import "./ReportCustomerModern.scss";

const RANGE_OPTIONS = [
  { id: "today", label: "Hôm nay" },
  { id: "7days", label: "7 ngày" },
  { id: "month", label: "Tháng này" },
  { id: "prevMonth", label: "Tháng trước" },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "Tất cả nguồn" },
  { value: "pos", label: "Tại quầy" },
  { value: "online", label: "Website / Fanpage" },
  { value: "referral", label: "Giới thiệu" },
];

const GROWTH_DATA = [18, 24, 21, 26];
const RETURN_DATA_NEW = [62, 75, 81, 77, 84, 89];
const RETURN_DATA_OLD = [198, 214, 238, 226, 244, 261];
const TIER_DATA = [
  { name: "VIP", y: 8, color: "#7c3aed" },
  { name: "Thân thiết", y: 22, color: "#a78bfa" },
  { name: "Thường xuyên", y: 35, color: "#c4b5fd" },
  { name: "Mới", y: 35, color: "#ede9fe" },
];
const REGION_DATA = [
  { name: "Hồ Chí Minh", y: 38, color: "#2563eb" },
  { name: "Hà Nội", y: 24, color: "#0f766e" },
  { name: "Miền Trung", y: 18, color: "#f59e0b" },
  { name: "Tỉnh khác", y: 20, color: "#ec4899" },
];

const CUSTOMER_ROWS = [
  { name: "Nguyễn Thị Mai", phone: "0901 234 567", totalSpent: 12400000, loyaltyPoint: 1240, tier: "VIP", color: "#7c3aed" },
  { name: "Trần Văn Hùng", phone: "0912 345 678", totalSpent: 8600000, loyaltyPoint: 860, tier: "VIP", color: "#7c3aed" },
  { name: "Lê Thị Hoa", phone: "0923 456 789", totalSpent: 5200000, loyaltyPoint: 520, tier: "Thân thiết", color: "#2563eb" },
  { name: "Phạm Minh Tuấn", phone: "0934 567 890", totalSpent: 3800000, loyaltyPoint: 380, tier: "Thường xuyên", color: "#10b981" },
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

export default function ReportCustomerModern() {
  document.title = "Báo cáo khách hàng";

  const [activeRange, setActiveRange] = useState("today");
  const [source, setSource] = useState("all");
  const [dateRange, setDateRange] = useState<[string, string]>([
    moment().startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);

  const growthOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "column", height: 240, backgroundColor: "transparent" },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: { categories: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"], lineColor: "#e5e7eb" },
      yAxis: { title: { text: undefined }, gridLineColor: "#f1f5f9" },
      plotOptions: { column: { borderRadius: 4 } },
      series: [{ type: "column", data: GROWTH_DATA, color: "#8b5cf6", name: "Khách mới" }],
    }),
    [activeRange]
  );

  const tierOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "pie", height: 220, backgroundColor: "transparent" },
      title: { text: undefined },
      credits: { enabled: false },
      plotOptions: { pie: { innerSize: "68%", borderWidth: 0, dataLabels: { enabled: false } } },
      series: [{ type: "pie", data: TIER_DATA }],
    }),
    [source]
  );

  const returnOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "areaspline", height: 280, backgroundColor: "transparent" },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: { categories: ["T10", "T11", "T12", "T01", "T02", "T03"], lineColor: "#e5e7eb" },
      yAxis: { title: { text: undefined }, gridLineColor: "#f1f5f9" },
      tooltip: { shared: true },
      plotOptions: { areaspline: { marker: { enabled: false }, lineWidth: 2, fillOpacity: 0.1 } },
      series: [
        { type: "areaspline", name: "Khách mới", data: RETURN_DATA_NEW, color: "#8b5cf6" },
        { type: "areaspline", name: "Khách quay lại", data: RETURN_DATA_OLD, color: "#2563eb" },
      ],
    }),
    [activeRange, source]
  );

  const regionOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "bar", height: 280, backgroundColor: "transparent" },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: { categories: REGION_DATA.map((item) => item.name) },
      yAxis: { title: { text: undefined }, gridLineColor: "#f1f5f9" },
      plotOptions: { bar: { borderRadius: 4 } },
      series: [{ type: "bar", data: REGION_DATA, name: "Tỷ trọng" }],
    }),
    [source]
  );

  return (
    <Fragment>
      <div className="page-content page-customer-report-modern">
        <TitleAction title="Báo cáo khách hàng" />

        <div className="report-topbar">
          <div className="report-topbar__left">
            <div className="report-topbar__title">Toàn cảnh khách hàng</div>
            <div className="report-topbar__subtitle">Cập nhật lúc {moment().format("HH:mm")} · {moment().format("DD/MM/YYYY")}</div>
          </div>

          <div className="report-topbar__filters">
            <div className="quick-range">
              {RANGE_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`quick-range__btn ${activeRange === item.id ? "active" : ""}`}
                  onClick={() => setActiveRange(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="report-topbar__select">
              <SelectCustom id="customerSourceModern" name="customerSourceModern" options={SOURCE_OPTIONS} fill value={source} onChange={(option) => setSource(option.value)} />
            </div>

            <div className="report-topbar__date">
              <DatePickerCustom value={dateRange} onChange={(range) => setDateRange(range)} placeholder="Chọn khoảng ngày..." />
            </div>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card"><div className="kpi-label">Tổng khách hàng</div><div className="kpi-value accent-purple">4,821</div><div className="kpi-delta up">↑ 89 KH mới tháng này</div></div>
          <div className="kpi-card"><div className="kpi-label">KH mới tháng này</div><div className="kpi-value">89</div><div className="kpi-delta up">↑ 12.3% tháng trước</div></div>
          <div className="kpi-card"><div className="kpi-label">Tỷ lệ quay lại mua</div><div className="kpi-value accent-purple">68.4%</div><div className="kpi-delta up">↑ 3.1% tháng trước</div></div>
          <div className="kpi-card"><div className="kpi-label">Tổng công nợ KH</div><div className="kpi-value accent-red">{formatCurrency(42600000)} đ</div><div className="kpi-delta dn">↑ 5.2M từ tháng trước</div></div>
        </div>

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

        <div className="table-card">
          <div className="table-header">
            <div>
              <h3>Danh sách khách hàng tiêu biểu</h3>
              <span>Xếp theo doanh thu tích lũy</span>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Điện thoại</th>
                  <th>Tổng mua</th>
                  <th>Điểm tích lũy</th>
                  <th>Nhóm</th>
                </tr>
              </thead>
              <tbody>
                {CUSTOMER_ROWS.map((item) => (
                  <tr key={item.phone}>
                    <td>{item.name}</td>
                    <td>{item.phone}</td>
                    <td>{formatCurrency(item.totalSpent)} đ</td>
                    <td>{item.loyaltyPoint.toLocaleString("vi-VN")}</td>
                    <td>
                      <span className="customer-badge" style={{ "--badge-color": item.color } as React.CSSProperties}>
                        {item.tier}
                      </span>
                    </td>
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
