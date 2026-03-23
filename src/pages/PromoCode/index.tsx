import React, { useState } from "react";
import { getPermissions } from "utils/common";
import AddPromoCodeModal from "./AddPromoCodeModal";
import { ITitleActions } from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";

import "./index.scss";

// Mock Data
const mockCoupons = [
  { id: 1, code: "REBORN20", type: "Phần trăm", value: "20%", min: "200.000", used: 45, total: 100, expiry: "31/03/2026", status: "active" },
  { id: 2, code: "GIAMGIA50K", type: "Số tiền", value: "50.000đ", min: "300.000", used: 78, total: 200, expiry: "30/04/2026", status: "active" },
  { id: 3, code: "VIPONLY30", type: "Phần trăm", value: "30%", min: "500.000", used: 12, total: 50, expiry: "31/03/2026", status: "active" },
  { id: 4, code: "FREESHIP", type: "Miễn ship", value: "100%", min: "150.000", used: 200, total: 200, expiry: "28/02/2026", status: "expired" },
  { id: 5, code: "NEWMEMBER", type: "Số tiền", value: "100.000đ", min: "0", used: 156, total: 500, expiry: "31/12/2026", status: "active" },
  { id: 6, code: "COMBO15", type: "Phần trăm", value: "15%", min: "400.000", used: 33, total: 100, expiry: "15/04/2026", status: "pending" },
];

const statusMap: Record<string, { label: string; badgeClass: string; headerClass: string }> = {
  active: { label: "Đang chạy", badgeClass: "c-badge c-badge--active", headerClass: "c-card-header--active" },
  pending: { label: "Chờ duyệt", badgeClass: "c-badge c-badge--pending", headerClass: "c-card-header--pending" },
  expired: { label: "Hết hạn", badgeClass: "c-badge c-badge--expired", headerClass: "c-card-header--expired" },
};

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

export default function PromoCode(props: any) {
  document.title = "Mã giảm giá";

  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [dataCategoryService, setDataCategoryService] = useState<any>(null);

  const titleActions: ITitleActions = {
    actions: [
      (permissions["CATEGORY_SERVICE_ADD"] == 1 || true) && {
        title: "Tạo mã mới",
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
        title="Mã giảm giá"
        titleBack="Khuyến mãi"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />

      <div className="promo-stats-grid">
        <StatCard title="Đang phát hành" value="15,420" sub="Mã giảm giá" icon={<Icon name="Tag" />} color="blue" />
        <StatCard title="Đã sử dụng" value="8,193" sub="Mã giảm giá" icon={<Icon name="Payment" />} color="green" />
        <StatCard title="Tổng doanh thu tạo ra" value="1.2B" sub="VNĐ" icon={<Icon name="MoneyFill" />} color="purple" trend={15} />
        <StatCard title="Tỷ lệ sử dụng" value="53.1%" sub="so với phát hành" icon={<Icon name="ChartLine" />} color="orange" trend={-2.4} />
      </div>

      <div className="coupon-grid">
        {mockCoupons.map((c) => {
          const mappedStatus = statusMap[c.status] || statusMap.pending;
          const usagePercent = (c.used / c.total) * 100;
          return (
            <div key={c.id} className="c-card hover:shadow-md">
              <div className={`c-card-header ${mappedStatus.headerClass}`}>
                <div className="c-card-header__inner">
                  <span className="c-card__code">{c.code}</span>
                  <span className={mappedStatus.badgeClass}>{mappedStatus.label}</span>
                </div>
              </div>
              <div className="c-card-body">
                <div className="c-card-info">
                  <div className="c-card-info__main">
                    <p className="c-card-info__val">{c.value}</p>
                    <p className="c-card-info__type">{c.type}</p>
                  </div>
                  <div className="c-card-info__min">
                    <p className="c-card-info__min-label">Đơn tối thiểu</p>
                    <p className="c-card-info__min-val">{c.min === "0" ? "Không giới hạn" : `${c.min}đ`}</p>
                  </div>
                </div>
                <div className="c-card-prog">
                  <div className="c-card-prog__text">
                    <span>Đã dùng: {c.used}/{c.total}</span>
                    <span>{Math.round(usagePercent)}%</span>
                  </div>
                  <div className="c-card-prog__bar-wrapper">
                    <div className="c-card-prog__bar" style={{ width: `${usagePercent}%` }} />
                  </div>
                </div>
                <div className="c-card-footer">
                  <span className="c-card-footer__hsd">HSD: {c.expiry}</span>
                  <div className="c-card-footer__actions">
                    <button className="c-card-footer__btn c-card-footer__btn--edit" onClick={() => {
                      setDataCategoryService(c);
                      setShowModalAdd(true);
                    }}>Sửa</button>
                    <button className="c-card-footer__btn c-card-footer__btn--del">Xóa</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddPromoCodeModal
        onShow={showModalAdd}
        data={dataCategoryService}
        onHide={() => setShowModalAdd(false)}
      />
    </div>
  );
}
