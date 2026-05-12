// [FitPro] Dashboard trạm — Tổng quan hoạt động chuỗi 6-9h sáng
import React, { useState, useContext } from "react";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "reborn-util";
import urls from "configs/urls";
import { UserContext, ContextType } from "contexts/userContext";
import Icon from "@/components/icon";
import { MOCK_DASHBOARD } from "@/mocks/community-hub/dashboard";

export default function DashboardCH() {
  // [FitPro] Tổng quan trạm
  document.title = "FitPro - Tổng quan trạm";
  const navigate = useNavigate();
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [masked, setMasked] = useState(true);

  const navTo = (path: string) => {
    if (path) navigate(path);
  };

  const data = MOCK_DASHBOARD;

  return (
    <div className="ch-dashboard">
      {/* [FitPro] Dual Cash-Flow banner — hiển thị 2 luồng tiền tách biệt, App chỉ chạm Luồng 1 */}
      <div
        style={{
          padding: "12px 16px",
          marginBottom: 14,
          background: "linear-gradient(90deg, #E4F7F3 0%, #fff 60%, #FFF0E3 100%)",
          border: "1px solid #d9e0de",
          borderRadius: 10,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          fontSize: 12,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>💼</span>
          <div>
            <div style={{ fontWeight: 700, color: "#0B2E2A" }}>Luồng 1 — App FitPro (SaaS · Direct)</div>
            <div style={{ color: "#6B8A85", marginTop: 2 }}>80k+/buổi · Gói 30/60/90 · Phí SaaS · <strong>Hiển thị trong App</strong></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", borderLeft: "1px dashed #d9e0de", paddingLeft: 12 }}>
          <span style={{ fontSize: 22 }}>🏭</span>
          <div>
            <div style={{ fontWeight: 700, color: "#7C2D12" }}>Luồng 2 — Herbalife (37% NPP · Zero-touch)</div>
            <div style={{ color: "#6B8A85", marginTop: 2 }}>HBL → TK cá nhân NPP · App KHÔNG cầm tiền · chỉ <a href="/fp_commission" style={{ color: "#FF8C42", fontWeight: 600 }}>đối soát file</a></div>
          </div>
        </div>
      </div>

      {/* STAT CARDS ROW - [CH] Community Hub metrics */}
      <div className="stat-cards-row">
        {[
          {
            label: "Thành viên tập luyện",
            icon: <Icon name="Customer" />,
            value: `Đang tập: ${data.members.active}/${data.members.total_slots}`,
            color: "primary",
          },
          {
            label: "Buổi tập hôm nay (6-9h)",
            icon: <Icon name="Barchart" />,
            value: `${data.checkins_today} buổi`,
            color: "accent",
          },
          {
            label: "Cần gia hạn (≤15 ngày)",
            icon: <Icon name="WarningCircle" />,
            value: `${data.members.expiring_soon} thành viên`,
            color: "warning",
          },
          {
            label: "Doanh thu trạm tháng này",
            icon: <Icon name="MoneyFill" />,
            value: masked ? "••••••••••" : `~${formatCurrency(data.mrr_vnd, ".", "")}đ`,
            color: "success",
            canMask: true,
          },
        ].map((card, i) => (
          <div key={i} className={`stat-card stat-card--${card.color}`}>
            <div className={`stat-card-icon ${card.color}`}>{card.icon}</div>
            <div className="stat-card-content">
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-value-container">
                <span className="stat-card-value">{card.value}</span>
                {card.canMask && (
                  <button onClick={() => setMasked(!masked)} className="stat-card-toggle">
                    {masked ? <Icon name="EyeSlash" /> : <Icon name="Eye" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW */}
      <div className="middle-row">
        {/* [FitPro] Station Layout Widget */}
        <div className="ch-widget ch-building-map">
          <div className="ch-widget__title">
            <Icon name="Buildings" />
            <span>Trạng thái thảm tập theo khu vực</span>
          </div>
          <div className="building-areas">
            {data.building_map.map((area) => {
              const pct = Math.round((area.current / area.capacity) * 100);
              return (
                <div key={area.area} className="area-item">
                  <div className="area-info">
                    <span className="area-name">{area.area}</span>
                    <span className="area-count">{area.current}/{area.capacity}</span>
                  </div>
                  <div className="area-bar">
                    <div
                      className={`area-bar__fill ${pct > 80 ? "high" : pct > 50 ? "medium" : "low"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* [FitPro] Quota Alert — buổi tập còn lại */}
        <div className="ch-widget ch-quota-alerts">
          <div className="ch-widget__title">
            <Icon name="WarningCircle" />
            <span>Cảnh báo buổi tập còn lại</span>
          </div>
          <div className="alert-list">
            {data.quota_alerts.map((alert) => (
              <div key={alert.member_id} className={`alert-item ${alert.remaining === 0 ? "critical" : "warning"}`}>
                <div className="alert-member">{alert.name}</div>
                <div className="alert-detail">
                  {alert.service}: <strong>{alert.remaining}/{alert.total}</strong> còn lại
                </div>
              </div>
            ))}
          </div>
          <div className="widget-footer" onClick={() => navTo(urls.customer_list)}>
            Xem tất cả
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="bottom-row">
        {/* [FitPro] Upcoming events — buổi tập/workshop */}
        <div className="ch-widget ch-events">
          <div className="ch-widget__title">
            <Icon name="CalendarFill" />
            <span>Buổi tập / sự kiện sắp tới</span>
          </div>
          <div className="event-list">
            {data.upcoming_events.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-date">
                  <span className="event-day">{event.date.split("-")[2]}</span>
                  <span className="event-month">Th{event.date.split("-")[1]}</span>
                </div>
                <div className="event-info">
                  <div className="event-title">{event.title}</div>
                  <div className="event-attendees">{event.attendees} người tham gia</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* [CH] Quick Access */}
        <div className="ch-widget ch-quick-access">
          <div className="ch-widget__title">
            <Icon name="SettingGrid" />
            <span>Truy cập nhanh</span>
          </div>
          <div className="quick-access-grid">
            {[
              { label: "Check-in trạm", icon: <Icon name="Barchart" />, path: "/ch_checkin" },
              { label: "Thành viên", icon: <Icon name="Customer" />, path: urls.customer_list },
              { label: "Đặt buổi tập", icon: <Icon name="Beauty" />, path: "/ch_services" },
              { label: "Sơ đồ thảm", icon: <Icon name="Buildings" />, path: "/ch_accommodation" },
              { label: "Giáo trình", icon: <Icon name="ManageWork" />, path: "/ch_courses" },
              { label: "Business Owner", icon: <Icon name="Partner" />, path: "/ch_partners" },
            ].map((item) => (
              <div key={item.label} className="quick-item" onClick={() => navTo(item.path)}>
                <div className="quick-item__icon">{item.icon}</div>
                <span className="quick-item__label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
