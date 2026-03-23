import React, { useState } from "react";
import { getPermissions } from "utils/common";
import AddPointModal from "./AddPointModal";
import { ITitleActions } from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";

import "./index.scss";

// Mock Data
const mockRewards = [
  { id: 1, type: "Voucher", title: "Voucher 50.000đ", cost: 500, used: 45, limit: 100 },
  { id: 2, type: "Voucher", title: "Voucher 100.000đ", cost: 900, used: 23, limit: 50 },
  { id: 3, type: "Dịch vụ", title: "Freeship 1 đơn", cost: 200, used: 312, limit: 999 },
  { id: 4, type: "Voucher", title: "Giảm 10% đơn hàng", cost: 300, used: 89, limit: 200 },
  { id: 5, type: "Quà tặng", title: "Quà tặng bí ẩn", cost: 2000, used: 5, limit: 20 },
  { id: 6, type: "Hạng thành viên", title: "Tháng Gold miễn phí", cost: 5000, used: 2, limit: 10 },
];

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "purple" | "red";
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, color, trend }) => (
  <div className={`promo-stat-card promo-stat-card--${color}`}>
    <div className="promo-stat-card__body">
      <div className="promo-stat-card__content">
        <p className="promo-stat-card__label">{title}</p>
        <p className="promo-stat-card__value">{value}</p>
        {sub && <p className="promo-stat-card__sub">{sub}</p>}
        {trend !== undefined && (
          <p className={`promo-stat-card__trend ${trend >= 0 ? "promo-stat-card__trend--up" : "promo-stat-card__trend--down"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% so với tháng trước
          </p>
        )}
      </div>
      <div className="promo-stat-card__icon">{icon}</div>
    </div>
  </div>
);

export default function ExchangePoints(props: any) {
  document.title = "Danh mục đổi điểm";

  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [dataCategoryService, setDataCategoryService] = useState<any>(null);

  const titleActions: ITitleActions = {
    actions: [
      (permissions["CATEGORY_SERVICE_ADD"] == 1 || true) && {
        title: "Thêm phần thưởng",
        callback: () => {
          setDataCategoryService(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  return (
    <div className="promo-page page-content">
      <HeaderTabMenu
        title="Danh mục đổi điểm"
        titleBack="Khách hàng thành viên"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />
      <div style={{ marginTop: "-16px", marginBottom: "24px", paddingLeft: "4px" }}>
      </div>

      <div className="promo-stats-grid">
        <StatCard title="Phần thưởng" value="6" icon={<Icon name="Gift" />} color="purple" />
        <StatCard title="Đã đổi tháng này" value="476" icon={<Icon name="CheckedCircle" fill="currentColor" />} color="green" />
        <StatCard title="Điểm đã tiêu" value="98.200" icon={<Icon name="Star" />} color="orange" />
        <StatCard title="Tỷ lệ đổi điểm" value="68%" icon={<Icon name="Charttable" />} color="blue" />
      </div>

      <div className="reward-grid">
        {mockRewards.map((item) => {
          const pct = Math.round((item.used / item.limit) * 100);
          return (
            <div key={item.id} className="reward-card">
              <div className="reward-card__header">
                <span className="reward-card__badge">{item.type}</span>
                <div className="reward-card__cost">
                  <p className="reward-card__cost-val">{item.cost.toLocaleString()}</p>
                  <p className="reward-card__cost-lbl">điểm</p>
                </div>
              </div>

              <h3 className="reward-card__title">{item.title}</h3>

              <div className="reward-card__progress">
                <div className="reward-card__progress-text">
                  <span>Đã đổi: {item.used}/{item.limit}</span>
                  <span className="reward-card__progress-pct">{pct}%</span>
                </div>
                <div className="reward-card__progress-bar-bg">
                  <div className="reward-card__progress-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
              </div>

              <div className="reward-card__actions">
                <button className="reward-card__btn reward-card__btn--outline" onClick={() => {
                  setDataCategoryService(item);
                  setShowModalAdd(true);
                }}>
                  Chỉnh sửa
                </button>
                <button className="reward-card__btn reward-card__btn--solid" onClick={() => {
                  setDataCategoryService(item);
                  setShowModalAdd(true);
                }}>
                  Xem
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AddPointModal
        onShow={showModalAdd}
        data={dataCategoryService}
        onHide={() => setShowModalAdd(false)}
      />
    </div>
  );
}
