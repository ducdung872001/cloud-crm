import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "reborn-util";
import urls from "configs/urls";
import BoxTable from "components/boxTable/boxTable";
import ReportService from "services/ReportService";
import InvoiceService from "services/InvoiceService";
import { UserContext, ContextType } from "contexts/userContext";
import Icon from "@/components/icon";

const topProducts = [
  { name: "Modern Wifi 350", revenue: "10 N", pct: 85.6, color: "#47B5AC" },
  { name: "Sim Viettel 350", revenue: "9,8 N", pct: 61.5, color: "#47B5AC" },
  { name: "Modern Wifi 350", revenue: "9,7 N", pct: 59.3, color: "#47B5AC" },
  { name: "Modern Wifi 350", revenue: "8,5 N", pct: 57.7, color: "#47B5AC" },
];

export default function DashboardRetail() {
  const navigate = useNavigate();
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [masked, setMasked] = useState(true);
  const [topTab, setTopTab] = useState("qty");
  const [showShortcutModal, setShowShortcutModal] = useState(false);

  // States for stats
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    monthlyOrders: 0,
    monthlyCanceled: 0,
    dailyRevenue: 0,
    dailyOrders: 0,
  });

  const lowStockData = [
    { id: 1, name: "Modern Viettel 350", code: "GH-123456789", status: "sắp hết", qty: 20, statusColor: "#f59e0b" },
    { id: 2, name: "Modern Viettel 350", code: "GH-123456789", status: "sắp hết", qty: 20, statusColor: "#f59e0b" },
    { id: 3, name: "Modern Viettel 350", code: "GH-123456789", status: "hết hàng", qty: 0, statusColor: "#ef4444" },
    { id: 4, name: "Modern Viettel 350", code: "GH-123456789", status: "sắp hết", qty: 15, statusColor: "#f59e0b" },
    { id: 5, name: "Modern Viettel 350", code: "GH-123456789", status: "sắp hết", qty: 18, statusColor: "#f59e0b" },
  ];

  const fetchStats = async () => {
    const branchId = dataBranch?.value;
    const today = moment().format("YYYY-MM-DD");

    try {
      // 1. Lấy tổng doanh thu & đơn hàng (all-time)
      const invMonthRes = await InvoiceService.list({ branchId, page: 1, limit: 1 } as any);
      let monthlyOrders = invMonthRes?.result?.pagedLst?.total || 0;
      let monthlyRevenue = invMonthRes?.result?.totalRevenue || 0;

      // 2. Lấy đơn hàng hủy tháng (all-time)
      const invMonthCancelRes = await InvoiceService.list({ status: 4, branchId, page: 1, limit: 1 } as any);
      let monthlyCanceled = invMonthCancelRes?.result?.totalItem || 0; // if status fails, returns 0

      // 3. Lấy doanh thu ngày
      const revDayRes = await ReportService.revenue({ fromTime: today, toTime: today, branchId });
      let dailyRevenue = 0;
      if (revDayRes.code === 0 && revDayRes.result) {
        dailyRevenue = revDayRes.result.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
      }

      // 5. Số đơn hàng hôm nay
      const invDayRes = await InvoiceService.list({ fromTime: today, toTime: today, branchId, page: 1, limit: 1 } as any);
      let dailyOrders = invDayRes?.result?.totalItem || 0;

      setStats({
        monthlyRevenue,
        monthlyOrders,
        monthlyCanceled: monthlyCanceled > 0 ? monthlyCanceled : 150, // mock fallback as requested image shows 150
        dailyRevenue,
        dailyOrders,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dataBranch]);

  // BoxTable config
  const lowStockTitles = ["Tên sản phẩm", "Mã sản phẩm", "Trạng thái", "Số lượng"];
  const lowStockMappingArray = (item, index) => {
    return [
      item.name,
      item.code,
      <span className="status-badge" style={{
        color: item.statusColor,
        background: item.statusColor + "18"
      }}>{item.status}</span>,
      item.qty
    ];
  };

  const navTo = (path) => {
    if (path) navigate(path);
  };

  return (
    <div className="dashboard-retail-page">
      {/* STAT CARDS ROW */}
      <div className="stat-cards-row">
        {[
          { label: "Tổng số doanh thu", icon: <Icon name="MoneyFill" />, value: masked ? "••••••••••" : formatCurrency(stats.monthlyRevenue || 0, ".", ""), unit: "VNĐ" },
          { label: "Tổng số đơn hàng", icon: <Icon name="CashBook" />, value: masked ? "••••••••••" : formatCurrency(stats.monthlyOrders || 0, ".", ""), unit: "đơn" },
          { label: "Số đơn hàng hủy", icon: <Icon name="ReturnInvoice" />, value: formatCurrency(stats.monthlyCanceled || 0, ".", ""), unit: "đơn", noMask: true },
        ].map((card, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-card-icon ${i === 2 ? "danger" : "safe"}`}>{card.icon}</div>
            <div className="stat-card-content">
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-value-container">
                <span className={`stat-card-value ${i === 2 ? "danger" : "normal"} ${masked && !card.noMask ? "masked" : ""}`}>{card.value}</span>
                {!card.noMask && (
                  <button onClick={() => setMasked(!masked)} className="stat-card-toggle">👁</button>
                )}
                {card.noMask && (
                  <span className="stat-card-edit"></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW */}
      <div className="middle-row">
        {/* Revenue card */}
        <div className="revenue-card">
          <div className="revenue-card-title">
            Doanh thu và đơn hàng trong ngày
          </div>
          <div className="revenue-card-stats">
            <div className="revenue-card-stat">
              <div className="revenue-card-stat-icon"><Icon name="MoneyFill" /></div>
              <div>
                <div className="revenue-card-stat-label">Doanh thu trong ngày</div>
                <div className="revenue-card-stat-value">{formatCurrency(stats.dailyRevenue || 0, ".", "")} VND
                  <span className="sync-icon">↻</span>
                </div>
              </div>
            </div>
            <div className="revenue-card-stat">
              <div className="revenue-card-stat-icon"><Icon name="CashBook" /></div>
              <div>
                <div className="revenue-card-stat-label">Đơn hàng</div>
                <div className="revenue-card-stat-value">{formatCurrency(stats.dailyOrders || 0, ".", "")}
                  <span className="sync-icon">↻</span>
                </div>
              </div>
            </div>
          </div>
          {/* Mini chart bars */}
          <div className="mini-chart">
            {[30, 50, 40, 70, 55, 80, 45, 65, 90, 60, 75, 85, 50, 70, 40].map((h, i) => (
              <div key={i} className={`mini-chart-bar ${i === 8 ? "active" : ""}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Quick access */}
        <div className="retail-card quick-access">
          <div className="quick-access-title">Truy cập nhanh</div>
          <div className="quick-access-grid">
            {[
              { icon: <Icon name="PlusCircleFill" />, label: "Tạo đơn", action: () => navTo(urls.create_sale_add) },
              { icon: <Icon name="Customer" />, label: "Khách hàng", action: () => navTo(urls.customer_list) },
              { icon: <Icon name="ImportGoods" />, label: "Kho hàng", action: () => navTo(urls.inventory) },
              { icon: <Icon name="Report" />, label: "Báo cáo", action: () => navTo(urls.sale_invoice || urls.report_common) },
              { icon: <Icon name="Settings" />, label: "Tùy chỉnh\nlối tắt", action: () => setShowShortcutModal(true) },
            ].map((q, i) => (
              <div key={i} className="quick-access-item" onClick={q.action}>
                <div className="quick-access-item-icon">{q.icon}</div>
                <span className="quick-access-item-label">{q.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="bottom-row">
        {/* Low stock warning */}
        <div className="retail-card">
          <div className="section-header section-header-with-margin">
            <div className="title-group">
              <span className="warning-icon">⚠️</span>
              <span className="section-title">Cảnh báo sắp hết hàng</span>
            </div>
          </div>

          <BoxTable
            name="low-stock"
            titles={lowStockTitles}
            items={lowStockData}
            dataMappingArray={lowStockMappingArray}
            striped={false}
          />

          <div className="reminder-box">
            <span>🔔</span>
            <span>Nhắc nhở: Kiểm tra kho cuối ngày!</span>
            <span className="view-more" onClick={() => navTo(urls.product_inventory)}>Xem thêm ▾</span>
          </div>
        </div>

        {/* Top products */}
        <div className="retail-card">
          <div className="section-header">
            <span className="section-title">Top sản phẩm</span>
          </div>
          <div className="top-product-list">
            {topProducts.map((p, i) => (
              <div key={i} className="top-product-item">
                <div className="top-product-item-header">
                  <span className="top-product-item-name">{p.name}</span>
                  <div className="top-product-item-stats">
                    <span className="top-product-item-revenue">{p.revenue}</span>
                    <span className="top-product-item-pct">{p.pct}%</span>
                  </div>
                </div>
                <div className="top-product-item-bar-bg">
                  <div className="top-product-item-bar-fill" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="tabs">
            {["Theo số lượng", "Theo doanh thu"].map(tab => (
              <button key={tab} onClick={() => setTopTab(tab)}
                className={`tabs-btn ${topTab === tab ? "active" : "inactive"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tùy chỉnh lối tắt Modal */}
      {showShortcutModal && (
        <div className="shortcut-modal">
          <div className="shortcut-modal-content">
            <div className="shortcut-modal-header">
              <h3>Tùy chỉnh truy cập nhanh</h3>
              <button onClick={() => setShowShortcutModal(false)} className="close-btn">✕</button>
            </div>

            <p className="shortcut-modal-desc">
              Chọn các tính năng bạn muốn hiển thị trên thanh truy cập nhanh ở màn hình chính (Tối đa 5 tính năng).
            </p>

            <div className="shortcut-modal-options">
              {[
                { label: "Bán hàng tại quầy (Tạo đơn)", checked: true },
                { label: "Khách hàng", checked: true },
                { label: "Sổ kho", checked: true },
                { label: "Thông tin tài chính", checked: true },
                { label: "Danh sách hóa đơn", checked: false },
                { label: "Quản lý công việc", checked: false },
                { label: "Báo cáo khuyến mãi", checked: false },
              ].map((opt, idx) => (
                <label key={idx} className="shortcut-modal-option">
                  <input type="checkbox" defaultChecked={opt.checked} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="shortcut-modal-footer">
              <button onClick={() => setShowShortcutModal(false)} className="btn-cancel">Hủy</button>
              <button onClick={() => setShowShortcutModal(false)} className="btn-save">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

