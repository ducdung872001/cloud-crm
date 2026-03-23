import React, { useState } from "react";
import { getPermissions } from "utils/common";
import AddPromotionBundleModal from "./AddPromotionBundleModal";
import { ITitleActions } from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";

import "./index.scss";

// Mock Data
const mockCombos = [
  { id: 1, name: "Combo Gia đình", products: ["Sản phẩm A", "Sản phẩm B", "Sản phẩm C"], orig: "450.000", sale: "350.000", pct: "22%", sold: 78, status: "active" },
  { id: 2, name: "Combo Tiết kiệm", products: ["Sản phẩm X", "Sản phẩm Y"], orig: "280.000", sale: "220.000", pct: "21%", sold: 134, status: "active" },
  { id: 3, name: "Combo VIP Premium", products: ["SP Premium", "SP Gold", "SP Luxury", "SP Ultra"], orig: "800.000", sale: "580.000", pct: "27%", sold: 45, status: "active" },
  { id: 4, name: "Combo Mùa hè 2026", products: ["SP Mùa hè", "SP Phiên bản mới"], orig: "320.000", sale: "250.000", pct: "22%", sold: 0, status: "pending" },
];

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "purple" | "red";
  trend?: number;
}

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: "Đang chạy", className: "combo-badge combo-badge--active" },
  pending: { label: "Chờ duyệt", className: "combo-badge combo-badge--pending" },
  expired: { label: "Hết hạn", className: "combo-badge combo-badge--expired" },
};

export default function PromotionBundle(props: any) {
  document.title = "Combo khuyến mãi";

  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [dataCategoryService, setDataCategoryService] = useState<any>(null);

  const titleActions: ITitleActions = {
    actions: [
      (permissions["CATEGORY_SERVICE_ADD"] == 1 || true) && {
        title: "Tạo combo mới",
        callback: () => {
          setDataCategoryService(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

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

  return (
    <div className="promo-page page-content">
      <HeaderTabMenu
        title="Combo khuyến mãi"
        titleBack="Khuyến mãi"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />

      <div className="promo-stats-grid">
        <StatCard title="Combo đang bán" value="28" icon={<Icon name="Gift" />} color="blue" />
        <StatCard title="Đã bán tháng này" value="1,245" icon={<Icon name="ShoppingBagOpen" />} color="green" />
        <StatCard title="Doanh thu Combo" value="458tr" icon={<Icon name="MoneyFill" />} color="purple" trend={8} />
        <StatCard title="Combo hiệu quả nhất" value="Gia đình" sub="850 lượt mua" icon={<Icon name="Star" />} color="orange" />
      </div>

      <div className="combo-grid">
        {mockCombos.map((c) => {
          const badge = statusMap[c.status] || statusMap.pending;
          return (
            <div key={c.id} className="combo-card">
              <div className="combo-card__header">
                <div>
                  <h3 className="combo-card__title">{c.name}</h3>
                  <div className="combo-card__badge-wrap">
                    <span className={badge.className}>{badge.label}</span>
                  </div>
                </div>
                <div className="combo-card__prices">
                  <p className="combo-card__price-sale">{c.sale}đ</p>
                  <p className="combo-card__price-orig">{c.orig}đ</p>
                </div>
              </div>

              <div className="combo-card__products">
                {c.products.map((p, i) => (
                  <span key={i} className="combo-card__product-tag">{p}</span>
                ))}
              </div>

              <div className="combo-card__footer">
                <div className="combo-card__stats">
                  <div>
                    <p className="combo-card__stat-label">Tiết kiệm</p>
                    <p className="combo-card__stat-val combo-card__stat-val--green">{c.pct}</p>
                  </div>
                  <div>
                    <p className="combo-card__stat-label">Đã bán</p>
                    <p className="combo-card__stat-val">{c.sold} combo</p>
                  </div>
                </div>
                <div className="combo-card__actions">
                  <button className="combo-card__btn combo-card__btn--outline" onClick={() => {
                    setDataCategoryService(c);
                    setShowModalAdd(true);
                  }}>Sửa</button>
                  <button className="combo-card__btn combo-card__btn--solid" onClick={() => {
                    setDataCategoryService(c);
                    setShowModalAdd(true);
                  }}>Xem</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddPromotionBundleModal
        onShow={showModalAdd}
        data={dataCategoryService}
        onHide={() => setShowModalAdd(false)}
      />
    </div>
  );
}
